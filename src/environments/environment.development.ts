import { AppEnvirontment } from './environments.model';

export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080/api/v1'
};

export const appEnvirontment: AppEnvirontment = {

    production: false,
    baseUrl: "http://localhost:8080/api/v1",
    auth0config: {
        domainUrl: "dev-yav2eandtl7nvth4.us.auth0.com",
        clientId: "UkwLhwh2EX2SEn14MnDSboEpJrn03r2H",
        secret: "YpxQxVVVrKMiQoZ8seMla13m5aARI4SItWWzdNBgf6JcqAbtjUNrjwC0QzmyYJhv"
    }


};
