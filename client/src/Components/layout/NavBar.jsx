import React from "react";
import {NavLink} from "react-router-dom";

function NavBar(){
    return (
        <div>
            <nav>
                <NavLink to="/signup">Signup</NavLink>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="githubanalysis">GitHubAnalysis</NavLink>
            </nav>

        </div>
    )
}
export default NavBar