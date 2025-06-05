package com.example.stealthlink;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.atomic.AtomicReference;

@RestController
@CrossOrigin(origins = "*")
public class AuthController {

    private final String clientId = "55ed4a85d47446cabf495312bc6621c1";
    private final String clientSecret = "ec8e6dde569a49beb1cdf9fa06a0ae3b";

    // WebClient for Spotify API calls
    private final WebClient apiWebClient = WebClient.builder()
            .baseUrl("https://api.spotify.com")
            .build();

    // Separate WebClient for Spotify Accounts (auth) calls
    private final WebClient authWebClient = WebClient.builder()
            .baseUrl("https://accounts.spotify.com")
            .build();

    // AtomicReference to store cached token
    private final AtomicReference<String> cachedToken = new AtomicReference<>(null);
    // Token expiration time (Instant)
    private Instant tokenExpiry = Instant.EPOCH;

    /**
     * Get valid access token, either cached or by requesting new one
     */
    private Mono<String> getAccessToken() {
        if (cachedToken.get() != null && Instant.now().isBefore(tokenExpiry)) {
            return Mono.just(cachedToken.get());
        }

        String authHeader = "Basic " + Base64.getEncoder()
                .encodeToString((clientId + ":" + clientSecret).getBytes());

        return authWebClient.post()
                .uri("/api/token")
                .header(HttpHeaders.AUTHORIZATION, authHeader)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .bodyValue("grant_type=client_credentials")
                .retrieve()
                .bodyToMono(Map.class)
                .map(tokenResponse -> {
                    String token = (String) tokenResponse.get("access_token");
                    Integer expiresIn = (Integer) tokenResponse.get("expires_in");
                    cachedToken.set(token);
                    tokenExpiry = Instant.now().plusSeconds(expiresIn - 60); // refresh 1 min early
                    return token;
                });
    }

    /**
     * Endpoint to search track by name
     */
    @GetMapping("/search")
    public Mono<ResponseEntity<String>> searchTrack(@RequestParam String name) {
        return getAccessToken()
                .flatMap(accessToken ->
                        apiWebClient.get()
                                .uri(uriBuilder -> uriBuilder
                                        .path("/v1/search")
                                        .queryParam("q", name)
                                        .queryParam("type", "track")
                                        .queryParam("limit", 1)
                                        .build())
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                                .retrieve()
                                .bodyToMono(Map.class)
                                .map(response -> {
                                    try {
                                        Map<String, Object> tracks = (Map<String, Object>) response.get("tracks");
                                        var items = (java.util.List<Map<String, Object>>) tracks.get("items");
                                        if (items.isEmpty()) {
                                            return ResponseEntity.status(404).body("No track found");
                                        }
                                        Map<String, Object> firstItem = items.get(0);
                                        Map<String, Object> externalUrls = (Map<String, Object>) firstItem.get("external_urls");
                                        String spotifyLink = (String) externalUrls.get("spotify");
                                        return ResponseEntity.ok(spotifyLink);
                                    } catch (Exception e) {
                                        return ResponseEntity.status(500).body("Error processing Spotify response");
                                    }
                                })
                );
    }
}
