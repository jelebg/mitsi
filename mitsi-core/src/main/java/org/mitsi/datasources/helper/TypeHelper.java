package org.mitsi.datasources.helper;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class TypeHelper {
	public static final String TYPE_STRING  = "string";
	public static final String TYPE_INTEGER = "integer";
	public static final String TYPE_FLOAT = "float";
	public static final String TYPE_DATE    = "date";
	// TODO : gérer des types plus compliqués
	
	// TODO : use DateTimeFormatter with java 8
	public static final String DATE_FORMAT = "yyyy-MM-dd'T'HH:mm:ss";
	
	public static String getTypeFromJdbc(int jdbcType) {
		switch(jdbcType) {
		case Types.TIMESTAMP :
		//case Types.TIMESTAMP_WITH_TIMEZONE :
		case Types.TIME :
		case Types.DATE :
			return TYPE_DATE;
			
		case Types.DECIMAL :
		case Types.DOUBLE :
		case Types.FLOAT :
			return TYPE_FLOAT;

		case Types.TINYINT :
		case Types.NUMERIC :
		case Types.INTEGER:
			return TYPE_INTEGER;
		
		case Types.NCHAR :
		case Types.VARCHAR :
		default :
			return TYPE_STRING;
		}
	}


	public static String fromJdbcToString(int jdbcType, ResultSet rs, int column) throws SQLException {
		if(rs.getObject(column) == null) {
			return null;
		}
		switch(jdbcType) {
		case Types.TIMESTAMP :
		//case Types.TIMESTAMP_WITH_TIMEZONE :
		case Types.TIME :
		case Types.DATE :
			// I know there is hundreeds of other 'better' ways to do that but I didn't want another lib like JODA just for that
			// TODO : maybe the perfs are just awfull here ...
			Date d = rs.getDate(column);
			if(d == null) {
				return null;
			}
			Calendar c = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
			c.setTime(d);
			return String.format("%04d-%02d-%02dT%02d:%02d:%02d.%03d",
					c.get(Calendar.YEAR),
					c.get(Calendar.MONTH+1),
					c.get(Calendar.DAY_OF_MONTH),
					c.get(Calendar.HOUR_OF_DAY),
					c.get(Calendar.MINUTE),
					c.get(Calendar.SECOND),
					c.get(Calendar.MILLISECOND)
					);
			
		case Types.DECIMAL :
		case Types.DOUBLE :
		case Types.FLOAT :
			return Double.toString(rs.getDouble(column));

		case Types.TINYINT :
		case Types.NUMERIC :
		case Types.INTEGER:
			return Long.toString(rs.getLong(column));
		
		case Types.NCHAR :
		case Types.VARCHAR :
		default :
			return rs.getString(column);
		}
		
	}
}
