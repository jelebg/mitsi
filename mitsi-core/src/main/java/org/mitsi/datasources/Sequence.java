package org.mitsi.datasources;


@SuppressWarnings("squid:ClassVariableVisibilityCheck")
public class Sequence {
	public String owner;
	public String name;
	public Long minValue;
	public String maxValue; // String because it can be higher thant what java long or javascript can handle
	public String currentValue;
	public Long incrementBy;

	public String jsonDetails;
}
