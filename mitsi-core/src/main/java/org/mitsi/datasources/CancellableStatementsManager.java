package org.mitsi.datasources;

import java.sql.PreparedStatement;
import java.sql.SQLException;

public interface CancellableStatementsManager {
	void addStatement(String datasourceName, PreparedStatement statement);
	void removeStatement(String datasourceName, PreparedStatement statement);
	void cancelAllForDatasource(String datasourceName) throws SQLException;
}
