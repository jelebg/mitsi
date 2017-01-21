package org.mitsi.mitsiwar.utils;

// TODO : a deplacer dans un package commons
public class StringUtils {
	public static boolean isEmpty(String str) {
		return str==null || str.isEmpty();
	}
	
	final protected static char[] hexArray = "0123456789ABCDEF".toCharArray();
	public static String toHexaString(byte [] bytes) {
	    char[] hexChars = new char[bytes.length * 2];
	    for ( int j = 0; j < bytes.length; j++ ) {
	        int v = bytes[j] & 0xFF;
	        hexChars[j * 2] = hexArray[v >>> 4];
	        hexChars[j * 2 + 1] = hexArray[v & 0x0F];
	    }
	    return new String(hexChars);
	}
}
