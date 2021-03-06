package org.mitsi.mitsiwar;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.log4j.Logger;
import org.mitsi.users.MitsiDatasources;
import org.mitsi.users.MitsiRulesConfig;
import org.mitsi.users.MitsiUsersConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

public class MitsiRestInterceptor extends HandlerInterceptorAdapter   {
	private static final Logger log = Logger.getLogger(MitsiRestInterceptor.class);

	@Autowired
	protected MitsiDatasources mitsiDatasources; //NOSONAR   
	@Autowired
	protected MitsiUsersConfig mitsiUsersConfig; //NOSONAR 
	@Autowired
	protected MitsiRulesConfig mitsiRulesConfig; //NOSONAR 

	@Override
	public boolean preHandle(HttpServletRequest request,
				            HttpServletResponse response,
				            Object handler) throws Exception {
		super.preHandle(request, response, handler);
		
		try {
			mitsiDatasources.loadIfNecessary();
		} 
		catch(Throwable t) { 
			log.error("exception while loading datasources", t);
		}
		try {
			mitsiUsersConfig.loadIfNecessary();
		} 
		catch(Throwable t) { 
			log.error("exception while loading users config", t);
		}
		try {
			mitsiRulesConfig.loadIfNecessary();
		} 
		catch(Throwable t) { 
			log.error("exception while loading rules config", t);
		}

		return true;
	}
	
}
