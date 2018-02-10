package org.mitsi.users;

import java.util.List;
import java.util.SortedSet;

import org.mitsi.datasources.MitsiDatasource;
import org.mitsi.datasources.MitsiLayer;

public interface MitsiDatasources {

	void loadIfNecessary();

	MitsiDatasource getDatasource(SortedSet<String> userGrantedGroups, boolean isUserConnected, String datasource);

	List<MitsiDatasource> getDatasources(SortedSet<String> userGrantedGroups, boolean isUserConnected);

	MitsiLayer getLayer(SortedSet<String> userGrantedGroups, boolean isUserConnected, String layer);

	List<MitsiLayer> getLayers(SortedSet<String> userGrantedGroups, boolean isUserConnected);

}
