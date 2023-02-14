package com.example.webrtc

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.annotation.JsonValue
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.exc.InvalidFormatException
import mu.KotlinLogging
import org.springframework.stereotype.Component
import org.springframework.web.reactive.socket.WebSocketHandler
import org.springframework.web.reactive.socket.WebSocketSession
import reactor.core.publisher.Mono
import reactor.core.publisher.Sinks


data class Event(
    @JsonProperty("type")
    var type: EventType,
    @JsonProperty("payload")
    val content: String,
) {
}

enum class EventType(@JsonValue val typeName: String) {
    MESSAGE("message"),
    NICKNAME("nickname"),
    ERROR("error");
}

@Component
class ReactiveWebSocketHandler : WebSocketHandler {
    private val chatHistory = Sinks.many().replay().limit<String>(1000)
    private val objectMapper: ObjectMapper = ObjectMapper()

    private val log = KotlinLogging.logger{}

    override fun handle(session: WebSocketSession): Mono<Void> {
        session.attributes[EventType.NICKNAME.typeName] = "Anon"

        return session.receive()
            .map { message -> message.payloadAsText }
            .map { payload ->
                try {
                    objectMapper.readValue(payload, Event::class.java)
                } catch (e: InvalidFormatException) {
                    Event(EventType.ERROR, e.message.toString())
                }
            }
            .doOnNext { event ->
                log.info { "event: $event" }
                when (event.type) {
                    EventType.MESSAGE -> chatHistory.tryEmitNext(
                        "${session.attributes[EventType.NICKNAME.typeName]} : ${event.content}")
                    EventType.NICKNAME -> session.attributes[EventType.NICKNAME.typeName] = event.content
                    EventType.ERROR -> log.info { "error : $event" }
                }
            }
            .doOnComplete {
                log.info { "Completed!" }
            }
            .zipWith(session.send(chatHistory.asFlux().map { session.textMessage(it) }))
            .then()
    }
}
