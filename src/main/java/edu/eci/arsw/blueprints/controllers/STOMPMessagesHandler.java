package edu.eci.arsw.blueprints.controllers;

import edu.eci.arsw.blueprints.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    @MessageMapping("/newpoint.{drawingId}")
    public void handlePointEvent(Point pt, @DestinationVariable String drawingId) throws Exception {
        System.out.println("New point received for drawing " + drawingId + ": " + pt);
        msgt.convertAndSend("/topic/newpoint." + drawingId, pt);
    }
}