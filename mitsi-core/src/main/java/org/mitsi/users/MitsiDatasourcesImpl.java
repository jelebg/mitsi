package org.mitsi.users;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.TreeMap;
import java.util.TreeSet;

import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.users.MitsiDatasourcesF.Datasource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;

import com.google.gson.Gson;

import org.apache.log4j.Logger;

public class MitsiDatasourcesImpl extends PooledResource implements MitsiDatasources  {
	private static final Logger log = Logger.getLogger(MitsiDatasourcesImpl.class);

	@Autowired
	private Resource mitsiDatasourcesFile; 

	private MitsiDatasourcesF mitsiDatasourcesFileLoaded = null;
	
	private Map<String, MitsiDatasource> datasources = new TreeMap<>();

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
			
			
			try(InputStreamReader isr = new InputStreamReader(mitsiDatasourcesFile.getInputStream(), StandardCharsets.UTF_8);
				BufferedReader bfr = new BufferedReader(isr)) {
				
				Gson gson = new Gson();
				mitsiDatasourcesFileLoaded = gson.fromJson(bfr, MitsiDatasourcesF.class);
				
				datasources = new TreeMap<>();
				for(Entry<String, Datasource> entry : mitsiDatasourcesFileLoaded.datasources.entrySet()) {
					TreeSet<String> userGroups = entry.getValue().userGroups == null ? null : new TreeSet<String>(Arrays.asList(entry.getValue().userGroups));
					
					MitsiDatasource datasource = new MitsiDatasource(
							entry.getKey(),
							entry.getValue().description,
							entry.getValue().provider,
							entry.getValue().driver,
							entry.getValue().jdbcUrl,
							entry.getValue().user,
							entry.getValue().password,
							entry.getValue().tags == null ? null : Arrays.asList(entry.getValue().tags),
							userGroups,
							entry.getValue().maxExportRows);
					datasource.setConnectSchema(entry.getValue().connectSchema);
					datasources.put(entry.getKey(), datasource);
				}
			}
		}
		catch(IOException e) {
			log.error("cannot load mitsi-datasources : '"+mitsiDatasourcesFile.getFilename()+"'", e);
		}
		
	}


	private static boolean isDatasourceGranted(TreeSet<String> userGrantedGroups, boolean isUserConnected, MitsiDatasource mitsiDatasource) {
		if(mitsiDatasource.getUserGroups() == null) {
			return false;
		}
		
		if(mitsiDatasource.getUserGroups().contains(MitsiUsersConfig.GROUP_PUBLIC)) {
			return true;
		}
		
		if(isUserConnected && mitsiDatasource.getUserGroups().contains(MitsiUsersConfig.GROUP_CONNECTED)) {
			return true; 
		}
		
		if(userGrantedGroups!=null && !Collections.disjoint(mitsiDatasource.getUserGroups(), userGrantedGroups)) {
			return true;
		}

		return false;
	}
	
	@Override
	public MitsiDatasource getDatasource(TreeSet<String> userGrantedGroups, boolean isUserConnected, String datasource) {
		MitsiDatasource ds = datasources.get(datasource);
		
		if(!isDatasourceGranted(userGrantedGroups, isUserConnected, ds)) {
			return null;
		}
		
		return ds;
	}
	
	@Override
	public 	List<MitsiDatasource> getDatasources(TreeSet<String> userGrantedGroups, boolean isUserConnected) {
		List<MitsiDatasource> groupsDataSources = new ArrayList<>();
		
		for(MitsiDatasource mitsiDatasource : datasources.values()) {
			if(!isDatasourceGranted(userGrantedGroups, isUserConnected, mitsiDatasource)) {
				continue;
			}
			groupsDataSources.add(mitsiDatasource);
		}
		return groupsDataSources;
	}
	
}
