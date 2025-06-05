package com.example.stealthlink;

import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

public class SpotifyService {

    private final WebClient webClient;

    public SpotifyService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.spotify.com")
                .build();
    }

    public Mono<String> searchTrack(String query, String accessToken) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/v1/search")
                        .queryParam("type", "track")
                        .queryParam("q", query)
                        .build())
                .header("Authorization", "Bearer " + accessToken)
                .retrieve()
                .bodyToMono(String.class);
    }
}

