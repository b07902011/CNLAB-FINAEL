import React from 'react';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
// import 'prismjs/components/prism-c';
// import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import "prismjs/themes/prism.css";
import { Paper } from "@material-ui/core";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      width: "80vw",
      height: "140vh",
      maxWidth: "350px",
      maxHeight: "600px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative"
    },
    paper2: {
      width: "80vw",
      maxWidth: "500px",
      display: "flex",
      alignItems: "center",
      flexDirection: "column",
      position: "relative"
    },
    container: {
      width: "100vw",
      height: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    EditorBody: {
      width: "calc( 100% - 20px )",
      margin: 10,
      overflowY: "scroll",
      height: "100%"
    }
  })
);

export const CodeEditer = ({ code, onChange }) => {
    const classes = useStyles();
    return (
        <div className={classes.container}>
            <Paper className={classes.paper} zDepth={2}>
                <Paper id="style-1" className={classes.EditorBody}>
                    <Editor
                        value={code}
                        onValueChange={code => onChange(code)}
                        overflow="scroll"
                        height="700px"
                        highlight={code => highlight(code, languages.js)}
                        padding={10}
                        style={{
                            fontFamily: '"Fira code", "Fira Mono", monospace',
                            fontSize: 12,
                        }}
                    />
                </Paper>
            </Paper>
        </div>
    );
}