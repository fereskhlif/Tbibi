package tn.esprit.pi.tbibi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class TbibiApplication {

    public static void main(String[] args) {
        SpringApplication.run(TbibiApplication.class, args);
    }

}
