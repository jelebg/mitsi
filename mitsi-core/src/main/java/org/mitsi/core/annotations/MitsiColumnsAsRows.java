package org.mitsi.core.annotations;

import static java.lang.annotation.ElementType.METHOD;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface MitsiColumnsAsRows {
	String [] value() default {}; // 2 columns names
	String[] excludeColumns();
}
