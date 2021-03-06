package org.mitsi.mitsiwar.connections;

import org.apache.log4j.Logger;
import org.mitsi.datasources.CancellableStatementsManager;

import java.io.Serializable;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** PreparedStatement are stored in the user's Session, so that we can cancel when the user asks for it
    Whereas it is not a good practice to store technical stuff in the user session, it is normal here
    because in the SQL tab, the user can run sql he wrote.
    Be aware if you did not notice it yet, the session mays be deleted anytime. It is not a problem
    because all the statements have a timeout, so they have to vanish soon anyway (if not, it would be
    a HUGE problem)
 */
public class ClientCancellableStatementsManager implements CancellableStatementsManager, Serializable {
    private static final long serialVersionUID = -286978823237391934L;
    private static final Logger log = Logger.getLogger(Client.class);

    private Map<String, Map<String, PreparedStatement>> cancellableStatements = new HashMap<>();

    public synchronized List<String> getAllDatasourcesWithStatements() {
        List<String> datasources = new ArrayList<>();

        for (Map.Entry<String, Map<String, PreparedStatement>> cancellableStatements : cancellableStatements.entrySet()) {
            if (cancellableStatements.getValue() != null && cancellableStatements.getValue().size() > 0) {
                datasources.add(cancellableStatements.getKey());
            }
        }

        return datasources;
    }

    public synchronized String getDatasourceBySqlId(String cancelSqlId) {
        // TODO : create another HashMap to avoid the for loop
        for (Map.Entry<String, Map<String, PreparedStatement>> cancellableStatements : cancellableStatements.entrySet()) {
            if (cancellableStatements.getValue().containsKey(cancelSqlId)) {
                return cancellableStatements.getKey();
            }
        }
        return null;
    }

    public synchronized List<SqlIdStatus> getCancelableSqls() {
        List<SqlIdStatus> sqlIdStatusList = new ArrayList<>();

        for(Map.Entry<String, Map<String, PreparedStatement>> statements : cancellableStatements.entrySet()) {
            for(String sqlId : statements.getValue().keySet()) {
                SqlIdStatus sqlIdStatus = new SqlIdStatus();
                sqlIdStatus.sqlId = sqlId;
                sqlIdStatus.running = true;
                // sqlIdStatus.runningForTime TODO
                sqlIdStatus.runningOnDatasource = statements.getKey();
                sqlIdStatusList.add(sqlIdStatus);
            }
        }

        return sqlIdStatusList;
    }

    @Override
    public synchronized long getDatasourceStatementsCount(String datasourceName) {
        Map<String, PreparedStatement> statements = cancellableStatements.get(datasourceName);
        if (statements == null) {
            return 0;
        }
        return statements.size();
    }

    @Override
    public synchronized void addStatement(String datasourceName, String cancelSqlId, PreparedStatement statement) {
        Map<String, PreparedStatement> statements = cancellableStatements.get(datasourceName);
        if (statements == null) {
            statements = new HashMap<String, PreparedStatement>();
            cancellableStatements.put(datasourceName, statements);
        }
        statements.put(cancelSqlId, statement);
    }

    @Override
    public synchronized void removeStatement(String datasourceName, String cancelSqlId) {
        Map<String, PreparedStatement> statements = cancellableStatements.get(datasourceName);
        if (statements == null) {
            return;
        }
        statements.remove(cancelSqlId);
    }

    @Override
    public synchronized void cancelAllForDatasource(String datasourceName) throws SQLException {
        Map<String, PreparedStatement> statements = cancellableStatements.get(datasourceName);
        if (statements == null) {
            return;
        }

        for (PreparedStatement statement : statements.values()) {
            try {
                if (!statement.isClosed()) {
                    statement.cancel();
                }
            }
            catch (Exception e) {
                // continue even if shit happens
                // TODO : not sure if all jdbc drivers implement toString correctly, but it should not be a real problem ...
                log.warn("cannot cancel statement : "+statement, e);
            }
        }
    }

    @Override
    public void cancel(String datasourceName, String cancelSqlId) throws SQLException {
        Map<String, PreparedStatement> statements = cancellableStatements.get(datasourceName);
        if (statements == null) {
            return;
        }

        PreparedStatement statement = statements.get(cancelSqlId);

        try {
            if (!statement.isClosed()) {
                statement.cancel();
            }
        }
        catch (Exception e) {
            // continue even if shit happens
            // TODO : not sure if all jdbc drivers implement toString correctly, but it should not be a real problem ...
            log.warn("cannot cancel statement : "+statement, e);
        }
    }
}

