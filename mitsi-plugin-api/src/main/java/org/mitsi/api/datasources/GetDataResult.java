package org.mitsi.api.datasources;

import java.util.List;

@SuppressWarnings("squid:ClassVariableVisibilityCheck")
public class GetDataResult {
    public List<Column> columns;
    public List<String[]> results;
    public List<String> messages;

}
