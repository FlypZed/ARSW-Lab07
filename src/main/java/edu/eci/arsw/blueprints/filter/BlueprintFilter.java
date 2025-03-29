package edu.eci.arsw.blueprints.filter;

import edu.eci.arsw.blueprints.model.Blueprint;

import java.util.Set;

public interface BlueprintFilter {
    /**
     * Filtrar un solo plano
     * @param bp Plano a filtrar
     * @return Plano filtrado
     */
    public Blueprint filterBlueprint(Blueprint bp);

    /**
     * Filtrar un conjunto de planos
     * @param blueprints Conjunto de planos a filtrar
     * @return Conjunto filtrado
     */
    public Set<Blueprint> filterBlueprints(Set<Blueprint> blueprints);
}

