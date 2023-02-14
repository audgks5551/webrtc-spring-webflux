package com.example.webrtc

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.*

@RestController
@RequestMapping("/message")
class MessageController (
    private val redisPubSubService: MessageService,
) {
    @PostMapping("/publish")
    fun publish(@RequestBody message: Message) : Mono<Void> {
        return redisPubSubService.publish(message)
    }

    @GetMapping("/subscribe")
    fun subscribe(): Flux<Message> {
        return redisPubSubService.subscribe()
    }
}