package edu.eci.arsw.blueprints.controllers;

import edu.eci.arsw.blueprints.model.Point;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Controller
public class STOMPMessagesHandler {

    @Autowired
    SimpMessagingTemplate msgt;

    private ConcurrentHashMap<String, List<Point>> drawingPoints = new ConcurrentHashMap<>();

    @MessageMapping("/newpoint.{drawingId}")
    public void handlePointEvent(Point pt, @DestinationVariable String drawingId) throws Exception {
        System.out.println("New point received for drawing " + drawingId + ": " + pt);

        drawingPoints.putIfAbsent(drawingId, Collections.synchronizedList(new ArrayList<>()));
        List<Point> points = drawingPoints.get(drawingId);
        points.add(pt);

        msgt.convertAndSend("/topic/newpoint." + drawingId, pt);

        if (points.size() >= 3) {
            msgt.convertAndSend("/topic/newpolygon." + drawingId, new ArrayList<>(points));
        }
    }
}