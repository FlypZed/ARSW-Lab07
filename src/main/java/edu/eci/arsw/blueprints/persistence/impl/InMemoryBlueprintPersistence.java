/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.persistence.impl;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 *
 * @author hcadavid
 */
@Service
public class InMemoryBlueprintPersistence implements BlueprintsPersistence{

    private final Map<Tuple<String,String>,Blueprint> blueprints=new ConcurrentHashMap<>();

    public InMemoryBlueprintPersistence() {
        //load stub data
        Point[] pts1 = new Point[]{new Point(200, 200), new Point(180, 300), new Point(160, 160), new Point(140, 100)};
        Point[] pts2 = new Point[]{new Point(300, 250), new Point(275, 230), new Point(250, 220)};
        Point[] pts3 = new Point[]{new Point(400, 350), new Point(380, 340), new Point(360, 330)};
        Point[] pts4 = new Point[]{new Point(150, 200), new Point(145, 200), new Point(320, 270)};

        Blueprint bp1=new Blueprint("Santiago", "p1",pts1);
        Blueprint bp2=new Blueprint("Santiago", "p2",pts2);
        Blueprint bp3=new Blueprint("Andres", "p3",pts3);
        Blueprint bp4=new Blueprint("Juan", "p4",pts4);

        blueprints.put(new Tuple<>(bp1.getAuthor(),bp1.getName()), bp1);
        blueprints.put(new Tuple<>(bp2.getAuthor(),bp2.getName()), bp2);
        blueprints.put(new Tuple<>(bp3.getAuthor(),bp3.getName()), bp3);
        blueprints.put(new Tuple<>(bp4.getAuthor(),bp4.getName()), bp4);

    }
    
    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        if (blueprints.putIfAbsent(new Tuple<>(bp.getAuthor(),bp.getName()), bp) != null){
            throw new BlueprintPersistenceException("The given blueprint already exists: "+bp);
        }
        else{
            blueprints.put(new Tuple<>(bp.getAuthor(),bp.getName()), bp);
        }        
    }

    @Override
    public Blueprint getBlueprint(String author, String blueprintName) throws BlueprintNotFoundException {
        Tuple<String, String> blueprintKey = new Tuple<>(author, blueprintName);
        Blueprint bp = blueprints.get(blueprintKey);
        if (bp == null) {
            throw new BlueprintNotFoundException("Blueprint not found: " + author + ", " + blueprintName);
        }
        return bp;
    }
    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> authorBlueprints = blueprints.values().stream()
                .filter(bp -> bp.getAuthor().equals(author))
                .collect(Collectors.toSet());

        if (authorBlueprints.isEmpty()) {
            throw new BlueprintNotFoundException("No blueprints found for author: " + author);
        }

        return authorBlueprints;
    }

    @Override
    public void updateBlueprint (String author, String bpname, Blueprint updatedBlueprint)throws BlueprintNotFoundException{
        Blueprint currentBlue = getBlueprint(author, bpname);
        if (currentBlue == null) {
            throw new BlueprintNotFoundException(BlueprintNotFoundException.NONEXISTENT);
        } else {
            currentBlue.setPoints(updatedBlueprint.getPoints());
        }
    }

    @Override
    public Set<Blueprint> getAllBluePrints() {
        return blueprints.values().stream().collect(Collectors.toSet());
    }

}
