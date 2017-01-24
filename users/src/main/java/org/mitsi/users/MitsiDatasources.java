package org.mitsi.users;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.TreeSet;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.mitsi.datasources.MitsiDatasource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.apache.log4j.Logger;

public class MitsiDatasources extends PooledResource {
	private static final Logger log = Logger.getLogger(MitsiDatasources.class);

	public static final String TAG_DATASOURCES = "datasources";
	public static final String FIELD_DESCRIPTION = "description";
	public static final String FIELD_PROVIDER = "provider";
	public static final String FIELD_DRIVER = "driver";
	public static final String FIELD_JDBC_URL = "jdbc.url";
	public static final String FIELD_USER = "user";
	public static final String FIELD_PASSWORD = "password";
	public static final String FIELD_CONNECT_SCHEMA = "connect.schema";
	public static final String FIELD_TAGS = "tags";
	public static final String FIELD_USER_GROUPS = "user.groups";

	@Autowired
	private Resource mitsiDatasourcesFile; 

	private Map<String, MitsiDatasource> datasources = new TreeMap<String, MitsiDatasource>();

	@Override
	public Date getResourceTimestamp() {
		long l = 0;
		try {
			l = mitsiDatasourcesFile.getFile().lastModified();
		}
		catch(Exception e) {
			//nothing
		}
		if(l>0) {
			return new Date(l);
		}
		return null;
	}
	
	@Override
	public void load() {

		try {
			log.info("loading '"+mitsiDatasourcesFile.getFilename()+"' (path:"+mitsiDatasourcesFile.getFile().getPath()+")");
			
			JSONParser parser = new JSONParser();
	// TODO : à remplacer par du GSON
			JSONObject jsonObject = (JSONObject) parser.parse(
					new BufferedReader(new InputStreamReader(mitsiDatasourcesFile.getInputStream(), "UTF-8")));
			JSONObject jsonDatasoures = (JSONObject) jsonObject.get(TAG_DATASOURCES);
			for(Object k : jsonDatasoures.keySet()) {
				JSONObject v = (JSONObject) jsonDatasoures.get(k);
				
				List<String> tags = new ArrayList<>();
				JSONArray jsonTags = (JSONArray) v.get(FIELD_TAGS);
				if(jsonTags != null) {
					for(Object o : jsonTags) {
						tags.add((String) o);
					}
				}
				TreeSet<String> userGroups = new TreeSet<>();
				JSONArray jsonUserGroups = (JSONArray) v.get(FIELD_USER_GROUPS);
				if(jsonUserGroups != null) {
					for(Object o : jsonUserGroups) {
						userGroups.add((String) o);
					}
				}
				
				MitsiDatasource datasource = new MitsiDatasource(
							(String) k,
							(String) v.get(FIELD_DESCRIPTION),
							(String) v.get(FIELD_PROVIDER),
							(String) v.get(FIELD_DRIVER),
							(String) v.get(FIELD_JDBC_URL),
							(String) v.get(FIELD_USER),
							(String) v.get(FIELD_PASSWORD),
							tags,
							userGroups);
				datasource.setConnectSchema((String) v.get(FIELD_CONNECT_SCHEMA));
				datasources.put((String) k, datasource);
				
			}
		}
		catch(IOException|ParseException e) {
			log.error("cannot load mitsiDatasourcesFile:'"+mitsiDatasourcesFile.getFilename()+"'", e);
		}
		
	}

	public Map<String, MitsiDatasource> getDatasources() {
		return datasources;
	}
	
	public Set<String> getDatasourceNames() {
		return datasources.keySet();
	}

	public MitsiDatasource getDatasource(String datasource) {
		loadIfNeccessary();
		return datasources.get(datasource);
	}
	

}
