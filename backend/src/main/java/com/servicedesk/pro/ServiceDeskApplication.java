package com.servicedesk.pro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServiceDeskApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceDeskApplication.class, args);
        System.out.println("====================================================");
        System.out.println("🚀 ServiceDesk Pro Spring Boot Server running on port 5000");
        System.out.println("📡 Storage: Persistent H2 Database (./data/servicedesk)");
        System.out.println("🤖 AI Engine: Smart Knowledge RAG Engine");
        System.out.println("====================================================");
    }
}
