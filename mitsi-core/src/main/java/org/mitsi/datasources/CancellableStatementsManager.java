package org.mitsi.datasources;

import java.sql.PreparedStatement;
import java.sql.SQLException;

public interface CancellableStatementsManager {
	void addStatement(String datasourceName, String cancelSqlId, PreparedStatement statement);
	void removeStatement(String datasourceName, String cancelSqlId);
	void cancelAllForDatasource(String datasourceName) throws SQLException;
	void cancel(String datasourceName, String cancelSqlId) throws SQLException;
}
