package com.example.webrtc

import com.fasterxml.jackson.annotation.JsonProperty
import org.springframework.data.redis.core.ReactiveRedisOperations
import org.springframework.data.redis.listener.ChannelTopic
import org.springframework.data.redis.listener.ReactiveRedisMessageListenerContainer
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.util.*

data class Message(
    @JsonProperty("type")
    val type: String,
    @JsonProperty("payload")
    val payload: String,
    @JsonProperty("userId")
    val userId: String,
)

@Service
class MessageService (
    private val messageOperations: ReactiveRedisOperations<String, Message>,
    private val reactiveMsgListenerContainer: ReactiveRedisMessageListenerContainer,
) {
    private val channelTopic: ChannelTopic = ChannelTopic("broadcast")

    fun publish(message: Message): Mono<Void> {
        return messageOperations
            .convertAndSend(channelTopic.topic, message)
            .then(Mono.empty())
    }

    fun subscribe(): Flux<Message> {
        return reactiveMsgListenerContainer
            .receive(Collections.singletonList(channelTopic),
                messageOperations.serializationContext.keySerializationPair,
                messageOperations.serializationContext.valueSerializationPair,
            )
            .map { it.message }
    }
}