package org.mitsi.users;

import java.util.List;
import java.util.TreeSet;

import org.mitsi.datasources.MitsiDatasource;

public interface MitsiDatasources {

	void loadIfNeccessary();

	MitsiDatasource getDatasource(TreeSet<String> userGrantedGroups, boolean isUserConnected, String datasource);

	List<MitsiDatasource> getDatasources(TreeSet<String> userGrantedGroups, boolean isUserConnected);

}
