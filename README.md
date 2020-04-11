# project_436-visualizers - M3 Write-up

1. #### Overview

   - Actor Adaptability is a visualization made to show how actors have a diverse set of skills that allow them to act in multiple genres using data from the top one thousand movies of the last decade. The main view is a network diagram which shows all the actors of the dataset and the genres they tend to act in. Readers can use this to see how actors compare to each other in the number of movies and diversity of genres they have been in. They can also compare the genres themselves by how many and which actors have acted in them. There is also a pie chart showing how many movies there are of each genre. When an actor is selected, it shows the movie genre data only for movies that the chosen actor has been a part of. This view is useful for looking at the ratios of genres in more detail, and it is aided by counts or percentages, depending on the user’s selection. Below that is a view which can be switched between a line chart and a bar chart. It is for viewing how the genres have changed over time, and it can be used to show how both the popularity of a genre or an actor’s interest in a genre shifted between 2006 and 2016.


2. #### Data

   - Description of your data in both domain-specific and abstract language with cardinality
     - The dataset contains a list of one thousand movies (items) with their associated data in a tabular format. We used a subset of the attributes: genre (A set of four categorical elements where only the first, main one was chosen. It comes from a set of 7 elements.), actors (A set of four categorical elements. Each comes from a set of 1985 elements.), and year (A quantitative attribute from a range of integers in [2006, 2016].).


   - Data Source
     - https://www.kaggle.com/PromptCloudHQ/imdb-data
   - External Code Sources
     - https://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
     - http://bl.ocks.org/mbostock/5100636
     - https://observablehq.com/@ericd9799/learning-stacked-bar-chart-in-d3-js
     - https://www.w3schools.com/howto/howto_js_autocomplete.asp
   - Data Pre-processing Pipeline
     - As linked above, we got our our original IMDB movies dataset from Kaggle.com. This dataset includes movies' genres, actors, and years produced, among other attributes. Our preprocessing pipeline consists of taking that information and transforming it into different JSON objects that are easier to manipulate and dramatically simplify the coding needed to produce the visualizations. Five JSON files are created as a result of our preprocessing pipeline:
       1. actor-links.json, which contains an array of all the pre-computed links that get displayed when an actor or genre is clicked in the network diagram,
       2. actor-to-genres.json, which contains an array of actors with counts of each genre they've played in,
       3. actor-to-year-genres.json, which contains a dictionary that maps actors to the number of movies of a certain genre the actor played in each year, and
       4. genre-to-actors.json, which contains an array of genres, each with a list of actors that have taken part in them.
       5. TODO: Line chart preprocessing

3. #### Goals and Tasks

   - Task Abstraction
     - Overall Task - Domain-specific
       - Our visualization aims to help the user realize the different genre of movies a specific actor has played over the past decade. Specifically, the network diagram allows users to browse through different actors and discover unique facts about a given actor, the pie chart will help the user discover the genre distribution of genres for a specific or group of actors, and the stacked bar chart will show the genre trends of each actor over the past decade. This visualization also allows the user to search for their favourite actor and develop better understanding of what types of movies the actor has been involved in over this time horizon.
     - Abstract Language
       - Analyze/Compare Trends
       - Discover Distribution
       - Browse Around
       - Search Nodes

4. #### Visualizations/Views and Rationale for Design Choices

   - **Network Diagram**
     - Marks:
       - *Point Mark* - Every actor in this dataset is represented with a node on the network diagram. Point marks are used because it's the most intuitive, there's no dimension that an actor should/would restrict since an actor is not defined with a specific value.
       - Channels:
         - *Spatial Positioning* - We used spatial positioning to display the actor's movie genre ratio where the actors that act in primarily action movies will have their representative nodes gravitated towards the "action segment" of the ring in the network diagram. If an actor has only worked in one genre, their node will be placed outside the ring into the affiliated genre. We believe this channel is effective and in combination with colour, really helps distinguish the different genres.
         - *Colour Hue* - We used colour hue to categorically disguish the different genres. Our rationale for this decision is due to the fact that colour is more effective that using symbols/shapes. We understand that colour hue does not scale well, but since we are only representing 7 different types of genres (including "other") we believe that this channel is appropriate. The colour of each node signifies the mode of an actor. That is, the genre they have done the most movies in. If the node is grey, it means that the actor has more than one mode. We used grey instead of combining hues as combining hues may complete mutate the colour to something completely different which may be unintuitive. In addition, if we were to combine the hues, this would create a lot more different colours which is difficult to distunguish.
         - *Area (2-D size)* - The actor's node size represents the number of movies they have acted in over the past decade. This distinction, however, is subtle and is merely present to provide the viewer with an overall idea rather than concrete numerical information. This is why we use our other views to display more detailed and quantifiable information about a specific actor.
         - *Line Width* - When an actor is selected/clicked on the network diagram, lines appear which connects to the genres which that specific actor has worked on. The width of the lines indicate the number of movies of that specific genre the actor has been a part of. Similar to node area size, this change is subtle and it is difficult for the user to fully derrive the quantitative information which again presents the need for our other views.
     - Interactions/Linkage
       - *Hover* - When a node is hovered, the actor's node becomes highlighted (outlined) and a detail tooltip appears which displays the name of the actor which the node represents. When a genre (ring segment) is hovered it and its name also get highlighted and all the actors that have acted in one or more movies in that given genre are also highlighted.
       - *Click* - When a node is selected/clicked, the data is filtered by reducing the opacity of all other nodes. Also, more details are shown by lines that connect that specified node to their affiliated genres appear. If a genre (ring segment) is clicked, all lines that connect actors to that specified genre will appear and the data will be filtered by reducing the opacity of the ndoes affiliated with actors not involved in this genre. The other views will update once an actor is selected to show additional and more detailed information about that specific person. If no node is selected, the other views (the pie and stacked charts) will  display the overall information of all the actors.
   - **Pie Chart:**

       - Marks:
         - *Area* - the area of each slice represents the proportion of movies an actor has done in the genre associated with the slice. See angle channel description for more information.

       - Channels:
         - *Angle* - the total angle of a slice in the pie chart is proportional to the percentage of movies in that specified genre over the past decade. We are aware that this encoding may not be the most effective, but we really wanted to showcase a part to whole relationship which is why we used a pie chart. To further assist the user, we have added labels showing both the count and percentage to clarify the values.
         - *Colour Hue* - Used to represent the different genres. This colour encoding is the exactly the same as the network diagram to maintain consistency and avoid confusion. For more details, look at Network Diagram
       - Interaction/Linkage
         - *Hover* - When a slice is hovered, the slice's outline appears and its radius increases. Since length or area is not used as a channel in the pie chart, this does not skew what our data represents. When an actor's slice is hovered, the individual line that connects the actor's node to that hovered genre is displayed on the network diagram.
         - *Click* - When a slice is selected, all the other slices will have their opacity reduced (similar to the network diagram) and the line that shows up on over in the network diagram is fixated. The bar/line chart also update to further filter based on the genre selected in the pie chart.
         - *Radio Buttons* - The pie chart radio buttons allow the user to change how they view the data labels (either by count or percentage)
   -   **Line/Stacked Bar Chart** (TODO: Double check please)
       - Marks:
         - Point Mark (Linechart) - the point represents the genre count of movies in a given year. The lines of the line chart connect the points to visualize an overall trend over time.
         - *Line Mark* (Barchart) - the length of a bar chart corresponds to a count of movies.

       - Channels:
         - *Hue* - Encodes the "genre" attribute. Colour encoding corresponds to both the network diagram and the pie chart. For more details, see the Network Diagram description.
         - *Horizontal position on a common scale* - encodes the "year" attribute (2006-2016).
         - *Length* - the length of a line mark in the bar chart  encodes a count of movies.
         - *Vertical Position on a common scale* - The vertical position of the points indicates the number of movies of a given genre in that year.
       - Interaction/Linkage
         - Currently, both the bar and line chart are unidirectionally linked to the chord diagram and pie chart, such that when an actor, genre, or pie slice is selected this view shows the correct distribution of movies produced that contain that actor and/or genre throughout the years from 2006-2016.

   **Screenshots** (TODO)

   - 

5. #### Reflection

6. #### Team Assessment
