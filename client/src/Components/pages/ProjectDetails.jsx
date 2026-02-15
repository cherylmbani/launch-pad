import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";

function ProjectDetails(){
    const [details, setDetails] = useState(null)
    const {id} = useParams();
    useEffect(()=>{
        fetch(`http://127.0.0.1:5555/projects/${id}`)
        .then(res=>res.json())
        .then(data=>{
            setDetails(data)
        })

    }, [id])
    return (
        <div>
            {details ? (
                <div>
                    <p>Title: {details.title}</p>
                    <div>Description: {details.description}</div>
                    <div>
                        <p>Minimum budget: {details.budget_min}</p>
                        <p>Maximum budget: {details.budget_max}</p>
                    </div>
                    <p>Timeline: {details.timeline_weeks}</p>
                    <p>Difficulty: {details.difficulty}</p>
                    <div>Skills: {details.skills_required?.join(",")}</div>
                </div>
            ):(
                <p>Loading project details...</p>
            )}

        </div>
    )
}
export default ProjectDetails;