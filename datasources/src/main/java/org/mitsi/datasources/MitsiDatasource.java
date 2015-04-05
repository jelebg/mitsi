package org.mitsi.datasources;

import java.util.List;

public class MitsiDatasource {
	public static final String PROVIDER_ORACLE_11G = "oracle_11g";
	
	private String name;
	private String description;
	private String provider;
	private String driver;
	private String jdbcUrl;
	private String user;
	private String password;
	private String connectSchema;
	private List<String> tags;
	
	public MitsiDatasource(String name, String description, String provider,
			String driver, String jdbcUrl, String user, String password, List<String> tags) {
		this.name = name;
		this.description = description;
		this.provider = provider;
		this.driver = driver;
		this.jdbcUrl = jdbcUrl;
		this.user = user;
		this.password = password;
		this.tags = tags;
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
		return connectSchema;
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

	@Override
	public String toString() {
		return "MitsiDatasource [name=" + name + ", description=" + description
				+ ", provider=" + provider + ", driver=" + driver
				+ ", jdbcUrl=" + jdbcUrl + ", user=" + user + ", password="
				+ password + ", connectSchema=" + connectSchema + ", tags="
				+ tags + "]";
	}

	


}
