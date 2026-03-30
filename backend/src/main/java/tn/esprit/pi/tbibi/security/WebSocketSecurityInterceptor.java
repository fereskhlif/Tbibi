package tn.esprit.pi.tbibi.security;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import tn.esprit.pi.tbibi.security.jwt.JwtService;

@Component
@RequiredArgsConstructor
public class WebSocketSecurityInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // First try native header (direct WebSocket)
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            
            // If not found, try URL query parameter (SockJS fallback)
            if (authHeader == null || authHeader.isEmpty()) {
                authHeader = accessor.getFirstNativeHeader("authorization");
            }
            
            // Last resort: try to extract from URL if present
            if ((authHeader == null || authHeader.isEmpty()) && accessor.getSessionAttributes() != null) {
                Object tokenObj = accessor.getSessionAttributes().get("Authorization");
                if (tokenObj != null) {
                    authHeader = tokenObj.toString();
                }
            }

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                try {
                    String email = jwtService.extractEmail(token);
                    if (email != null) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        if (jwtService.isTokenValid(token, userDetails)) {
                            UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                            accessor.setUser(authentication);
                            System.out.println("✅ WebSocket authenticated for user: " + email);
                        } else {
                            System.out.println("❌ WebSocket token validation failed for user: " + email);
                        }
                    }
                } catch (Exception e) {
                    System.out.println("⚠️ WebSocket JWT processing error: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("⚠️ No Authorization header found in WebSocket connection");
            }
        }
        return message;
    }
}
