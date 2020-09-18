import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  app.get( "/filteredimage/", async ( req: Request, res: Response ) => {
    let { image_url } = req.query;

    // check image url is not empty
    if ( !image_url ) {
      return res.status(400)
                .send(`image url is required`);
    }
    
    try {

      // download, filter, and save the filtered image locally
      const filteredpath = await filterImageFromURL(image_url)

      res.status(200).sendFile(filteredpath, {}, (err) => {
        
        if (err) { 
          return res.status(422).send(`Not able to process the image`); 
        }
        
        // Deletes any files on the server
        deleteLocalFiles([filteredpath]);
      })

    } catch (err) {
      res.status(422).send(`Not able to process the image, Make sure that image url is correct`);
    }

  } );
  
  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();