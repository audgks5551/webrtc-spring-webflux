package com.example.webrtc

import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.reactive.result.view.Rendering
import reactor.core.publisher.Mono

@Controller
class TestController {
    @GetMapping("/websocket")
    fun home() : Mono<Rendering> {
        return Mono.just(Rendering.view("websocket").build())
    }

    @GetMapping("/webrtc")
    fun sse() : Mono<Rendering> {
        return Mono.just(Rendering.view("webrtc").build())
    }
}