package org.mitsi.users;

import java.util.Date;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import org.apache.log4j.Logger;

public abstract class PooledResource {
	private static final Logger log = Logger.getLogger(PooledResource.class);
	private Date lastLoadTry = null;
	private int reloadIntervalMilliSec = 5000;
	
	private ReadWriteLock lock;

	public PooledResource() {
		lock = new ReentrantReadWriteLock();
	}
	
	protected void readLock() {
		lock.readLock().lock();
	}
	protected void readUnlock() {
		lock.readLock().unlock();
	}
	
	// load is always called with the write lock locked
	public abstract void load();
	
	public Date getResourceTimestamp() {
		return null;
	}
	
	public void loadIfNecessary() {
		Date current = new Date();
		
		lock.readLock().lock();
		Date lastLoadTryTemp = lastLoadTry;
		lock.readLock().unlock();
		
		if(lastLoadTryTemp == null) {
			try {
				lock.writeLock().lock();
				if(lastLoadTry == null) {
					log.debug("first load of "+this);
					// init
					lastLoadTry = current;
					load();
				}
			}
			finally {
				lock.writeLock().unlock();
			}
		}
		else if( lastLoadTryTemp.getTime()+reloadIntervalMilliSec < current.getTime()) {
			Date resourceTimestamp = getResourceTimestamp();
			
			if(resourceTimestamp == null || resourceTimestamp.after(lastLoadTryTemp)	) {
				try {
					lock.writeLock().lock();
	
					if(resourceTimestamp == null || resourceTimestamp.after(lastLoadTry)	) {
						log.debug("reload of "+this+
								" because lastLoadTry="+lastLoadTry.getTime()+" and current="+current.getTime());
						lastLoadTry = current;
						load();
					}
				}
				finally {
					lock.writeLock().unlock();
				}
			}
			
		}
	}
}
