import React from "react";
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

export const Message = ({ data : {name, content}, index }) => {
    return (
        <ListItem key={`${index}_${name}_${content}`}>
            <ListItemText primary={`${name} : ${content}`}/>
        </ListItem>
    );
}