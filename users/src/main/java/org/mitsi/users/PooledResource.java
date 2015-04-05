package org.mitsi.users;

import java.util.Date;

import org.apache.log4j.Logger;

public abstract class PooledResource {
	private static final Logger log = Logger.getLogger(PooledResource.class);
	private Date lastLoadTry = null;
	private int reloadIntervalMilliSec = 5000;
	
	
	public abstract void load();
	
	public Date getResourceTimestamp() {
		return null;
	}
	
	public void loadIfNeccessary() {
		Date current = new Date();

		if(lastLoadTry == null) {
			log.debug("first load of "+this);
			// init
			lastLoadTry = current;
			load();
		}
		else if( lastLoadTry.getTime()+reloadIntervalMilliSec < current.getTime()) {
			Date resourceTimestamp = getResourceTimestamp();
			//log.debug("lastLoadTry="+lastLoadTry.getTime()+" and current="+current.getTime());
			if(resourceTimestamp == null || resourceTimestamp.after(lastLoadTry)	) {
				log.debug("reload of "+this+
						" because lastLoadTry="+lastLoadTry.getTime()+" and current="+current.getTime());
				load();
			}
			lastLoadTry = current;
		}
	}
}
