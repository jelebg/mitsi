package org.mitsi.datasources;

import java.util.List;

public class MitsiLayer {
    private String name = null;
    private String description = null;
    private List<String> tags = null;

    private List<String> datasourceNames = null;

    public MitsiLayer(String name, String description, List<String> tags, List<String> datasourceNames) {
        this.name = name;
        this.description = description;
        this.tags = tags;
        this.datasourceNames = datasourceNames;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getTags() {
        return tags;
    }

    public List<String> getDatasources() {
        return datasourceNames;
    }
}
