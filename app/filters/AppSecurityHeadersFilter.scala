package filters

import play.api.http.DefaultHttpFilters
import play.filters.headers.SecurityHeadersFilter

import javax.inject.Inject

class AppSecurityHeadersFilter @Inject() (securityHeadersFilter: SecurityHeadersFilter) extends DefaultHttpFilters(securityHeadersFilter){

}
