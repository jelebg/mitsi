package org.mitsi.users;

import java.util.List;
import java.util.SortedSet;

import org.mitsi.datasources.MitsiDatasource;

public interface MitsiDatasources {

	void loadIfNecessary();

	MitsiDatasource getDatasource(SortedSet<String> userGrantedGroups, boolean isUserConnected, String datasource);

	List<MitsiDatasource> getDatasources(SortedSet<String> userGrantedGroups, boolean isUserConnected);

}
