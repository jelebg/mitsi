package org.mitsi.core.annotations;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static java.lang.annotation.ElementType.TYPE;

@Target(TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface RestrictSql {
	String DEFAULT_RESTRICTION = "\\s*select\\s.*";

	String value() default DEFAULT_RESTRICTION;
}
