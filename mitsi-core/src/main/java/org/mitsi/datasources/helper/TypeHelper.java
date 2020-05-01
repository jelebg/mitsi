package org.mitsi.datasources.helper;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

import org.apache.log4j.Logger;
import org.mitsi.datasources.MitsiConnection;

public class TypeHelper {
	private static final Logger log = Logger.getLogger(TypeHelper.class);
	public static final String TYPE_STRING  = "string";
	public static final String TYPE_INTEGER = "integer";
	public static final String TYPE_FLOAT = "float";
	public static final String TYPE_DATE    = "date";
	// TODO : gérer des types plus compliqués
	// TODO : gerer les blobs binaires
	
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

		case Types.CHAR :
		case Types.VARCHAR :
		case Types.LONGVARCHAR :
		case Types.NCHAR :
		case Types.NVARCHAR :
		case Types.LONGNVARCHAR :
		default :
			return TYPE_STRING;
		}
	}


	public static String fromJdbcToString(int jdbcType, ResultSet rs, int column) throws SQLException {
		switch(jdbcType) {
		case Types.TIMESTAMP :
		//case Types.TIMESTAMP_WITH_TIMEZONE : // TODO
			Timestamp timestamp = rs.getTimestamp(column);
			if(timestamp == null) {
				return null;
			}
			Calendar cTimestamp = Calendar.getInstance(TimeZone.getTimeZone("UTC"));
			cTimestamp.setTimeInMillis(timestamp.getTime());
			return String.format("%04d-%02d-%02dT%02d:%02d:%02d.%09d",
					cTimestamp.get(Calendar.YEAR),
					cTimestamp.get(Calendar.MONTH)+1,
					cTimestamp.get(Calendar.DAY_OF_MONTH),
					cTimestamp.get(Calendar.HOUR_OF_DAY),
					cTimestamp.get(Calendar.MINUTE),
					cTimestamp.get(Calendar.SECOND),
					1000000*cTimestamp.get(Calendar.MILLISECOND) + timestamp.getNanos()
			);

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
			if(rs.getObject(column) == null) {
				return null;
			}
			return Double.toString(rs.getDouble(column));

		case Types.TINYINT :
			if(rs.getObject(column) == null) {
				return null;
			}
			return Long.toString(rs.getLong(column));

		case Types.NUMERIC :
		case Types.INTEGER:
			if(rs.getObject(column) == null) {
				return null;
			}
			BigDecimal bd = rs.getBigDecimal(column);
			return bd.toString();

		case Types.LONGVARCHAR :
			return getStringAsStream(rs, column);

		case Types.CHAR :
		case Types.NCHAR :
		case Types.VARCHAR :
		case Types.NVARCHAR :
			if(rs.getObject(column) == null) {
				return null;
			}
			return rs.getString(column);

		default :
			if(rs.getObject(column) == null) {
				return null;
			}
			return "(object)";

		}
		
	}
	
	static final long MAX_BLOB_SIZE = 4096; // TODO : rendre configurable
	public static String getStringAsStream(ResultSet rs, int column)  {
		// TODO : utiliser IoUtils (apache) 
		InputStream is;
		StringBuilder sb=new StringBuilder();
		try {
			is = rs.getAsciiStream(column);
			if(is == null) {
				return null;
			}
			BufferedReader br = new BufferedReader(new InputStreamReader(is));
			String read;
	
			while((read=br.readLine()) != null) {
			    sb.append(read);   
			    if(sb.length() >= MAX_BLOB_SIZE) {
			    	sb.append("...(max blob size reached)");
			    	break;
			    }
			}
	
			br.close();
		} catch (SQLException e) {
			log.error("impossible to get value from database", e);
			return "impossible to get value from database : "+e.getClass().getName()+"/"
					+e.getMessage()+" (code:"+e.getErrorCode()+")";
		} catch (IOException e) {
			log.error("impossible to get value from database", e);
			return "impossible to get value from database : "+e.getClass().getName()+"/"
					+e.getMessage();
		}

		return sb.toString();		
	}
}
