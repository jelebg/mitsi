package org.mitsi.mitsiwar.common;

import java.util.List;

import org.mitsi.datasources.Schema;

public class Datasource {
	public String name;
	public String description;
	public List<String> tags;
	public boolean connected;
	public List<Schema> schemas;

}
