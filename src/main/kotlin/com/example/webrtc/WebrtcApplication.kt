package com.example.webrtc

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.runApplication

@SpringBootApplication
class WebrtcApplication

fun main(args: Array<String>) {
    runApplication<WebrtcApplication>(*args)
}
