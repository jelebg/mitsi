package org.mitsi.users;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

import org.apache.log4j.Logger;
import org.mitsi.rules.Rule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;

import com.google.gson.Gson;

public class MitsiRulesConfigImpl extends PooledResource implements MitsiRulesConfig {
	private static final Logger log = Logger.getLogger(MitsiUsersConfigImpl.class);

	@Autowired
	private Resource rulesFile; 

	@SuppressWarnings("squid:ClassVariableVisibilityCheck")
	
	private class RulesFile {
		List<Rule> rules;
	}
	
	RulesFile rulesFileLoaded = null;
	
	@Override
	public Date getResourceTimestamp() {
		long l = 0;
		try {
			l = rulesFile.getFile().lastModified();
		}
		catch(Exception e) {
			log.debug("error in getResourceTimestamp", e);
		}
		if(l>0) {
			return new Date(l);
		}
		return null;
	}
	
	@Override
	public void load() {

		try {
			log.info("loading '"+rulesFile.getFilename()+"' (path:"+rulesFile.getFile().getPath()+")");
			try(InputStreamReader isr = new InputStreamReader(rulesFile.getInputStream(), StandardCharsets.UTF_8);
				BufferedReader bfr = new BufferedReader(isr)) {
			
				Gson gson = new Gson();
				RulesFile rulesFileLoadedTemp = gson.fromJson(bfr, RulesFile.class);

				rulesFileLoaded = rulesFileLoadedTemp;
			}
			
		}
		catch(IOException e) {
			try {
				log.error("cannot load mitsi rules config :'"+rulesFile.getFilename()+"' (path:"+rulesFile.getFile().getPath()+")", e);
			} catch (IOException e1) {
				log.error(e1);
			}
		}
		
	}

	@Override
	public List<Rule> getRules() {
		// TODO Auto-generated method stub
		try {
			readLock();
			return rulesFileLoaded == null ? null : rulesFileLoaded.rules;
		}
		finally {
			readUnlock();
		}
	}
}
