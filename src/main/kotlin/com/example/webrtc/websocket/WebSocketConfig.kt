package com.example.webrtc.websocket

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.reactive.HandlerMapping
import org.springframework.web.reactive.handler.SimpleUrlHandlerMapping
import org.springframework.web.reactive.socket.WebSocketHandler

@Configuration
class WebSocketConfig(
    private val webSocketHandler: WebSocketHandler,
) {

    @Bean
    fun webSocketHandlerMapping() : HandlerMapping =
        SimpleUrlHandlerMapping().apply {
            order = -1
            urlMap = mapOf("/event-emitter" to webSocketHandler)
        }
}