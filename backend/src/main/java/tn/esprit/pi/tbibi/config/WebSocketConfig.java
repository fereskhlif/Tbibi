package tn.esprit.pi.tbibi.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker  // ✅ Active SimpMessagingTemplate
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // ✅ Canal d'écoute du client (Angular s'abonne à /topic/...)
        config.enableSimpleBroker("/topic");
        // ✅ Préfixe pour les messages envoyés au serveur
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // ✅ Point de connexion WebSocket depuis Angular
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")  // autorise Angular localhost:4200
                .withSockJS();                  // support navigateur
    }
}