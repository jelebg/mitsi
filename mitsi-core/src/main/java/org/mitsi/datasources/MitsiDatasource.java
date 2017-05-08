package org.mitsi.datasources;

import java.util.Date;
import java.util.List;
import java.util.TreeSet;

public class MitsiDatasource {
	
	private static final int DEFAULT_MAX_EXPORT_ROWS        = 1000000;
	private static final int DEFAULT_POOL_INITIAL_SIZE      = 0;
	private static final int DEFAULT_POOL_MIN_SIZE          = 0;
	private static final int DEFAULT_POOL_MAX_SIZE          = 5;
	private static final int DEFAULT_POOL_MAX_IDLE_TIME_SEC = 3600;
	private static final int DEFAULT_POOL_ACQUIRE_INCREMENT = 1;
	
	private String name;
	private String description;
	private String provider;
	private String driver;
	private String jdbcUrl;
	private String user;
	private String password;
	private String connectSchema;
	private List<String> tags;
	private TreeSet<String> userGroups;
	private long maxExportRows        = DEFAULT_MAX_EXPORT_ROWS;
	private long poolInitialSize      = DEFAULT_POOL_INITIAL_SIZE;
	private long poolMinSize          = DEFAULT_POOL_MIN_SIZE;
	private long poolMaxSize          = DEFAULT_POOL_MAX_SIZE;
	private long poolMaxIdleTimeSec   = DEFAULT_POOL_MAX_IDLE_TIME_SEC;
	private long poolAcquireIncrement = DEFAULT_POOL_ACQUIRE_INCREMENT;
	
	public class Cache 	{
		List<DatabaseObject> databaseObjects;
		Date lastCacheUpdate;
	}
	
	public MitsiDatasource(String name, String description, String provider,
			String driver, String jdbcUrl, String user, String password, List<String> tags,
			TreeSet<String> userGroups, Long maxExportRows) {
		this.name = name;
		this.description = description;
		this.provider = provider;
		this.driver = driver;
		this.jdbcUrl = jdbcUrl;
		this.user = user;
		this.password = password;
		this.tags = tags;
		this.userGroups = userGroups;
		if(maxExportRows != null) {
			this.maxExportRows = maxExportRows;
		}
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getProvider() {
		return provider;
	}

	public void setProvider(String provider) {
		this.provider = provider;
	}

	public String getDriver() {
		return driver;
	}

	public void setDriver(String driver) {
		this.driver = driver;
	}

	public String getJdbcUrl() {
		return jdbcUrl;
	}

	public void setJdbcUrl(String jdbcUrl) {
		this.jdbcUrl = jdbcUrl;
	}

	public String getUser() {
		return user;
	}

	public void setUser(String user) {
		this.user = user;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public String getConnectSchema() {
		return connectSchema==null?getUser():connectSchema;
	}

	public void setConnectSchema(String connectSchema) {
		this.connectSchema = connectSchema;
	}

	public List<String> getTags() {
		return tags;
	}

	public void setTags(List<String> tags) {
		this.tags = tags;
	}

	public TreeSet<String> getUserGroups() {
		return userGroups;
	}

	public void setUserGroups(TreeSet<String> userGroups) {
		this.userGroups = userGroups;
	}

	public long getMaxExportRows() {
		return maxExportRows;
	}

	public void setMaxExportRows(Long maxExportRows) {
		this.maxExportRows = maxExportRows;
	}

	public long getPoolInitialSize() {
		return poolInitialSize;
	}

	public void setPoolInitialSize(long poolInitialSize) {
		this.poolInitialSize = poolInitialSize;
	}

	public long getPoolMinSize() {
		return poolMinSize;
	}

	public void setPoolMinSize(long poolMinSize) {
		this.poolMinSize = poolMinSize;
	}

	public long getPoolMaxSize() {
		return poolMaxSize;
	}

	public void setPoolMaxSize(long poolMaxSize) {
		this.poolMaxSize = poolMaxSize;
	}

	public long getPoolMaxIdleTimeSec() {
		return poolMaxIdleTimeSec;
	}

	public void setPoolMaxIdleTimeSec(long poolMaxIdleTimeSec) {
		this.poolMaxIdleTimeSec = poolMaxIdleTimeSec;
	}

	public long getPoolAcquireIncrement() {
		return poolAcquireIncrement;
	}

	public void setPoolAcquireIncrement(Long poolAcquireIncrement) {
		this.poolAcquireIncrement = poolAcquireIncrement;
	}


	@Override
	public String toString() {
		return "MitsiDatasource [name=" + name + ", description=" + description
				+ ", provider=" + provider + ", driver=" + driver
				+ ", jdbcUrl=" + jdbcUrl + ", user=" + user + ", password="
				+ password + ", connectSchema=" + connectSchema + ", tags="
				+ tags + ", userGroups=" + userGroups + ", maxExportRows=" + maxExportRows
				+ "]";
	}





	


}
