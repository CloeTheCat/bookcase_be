FROM node:16

# set a directory for the app
WORKDIR /usr/src/app

# copy all the files to the container
COPY . .

# install dependencies
RUN npm install

# define the port number the container should expose
EXPOSE 8080

# run the command
CMD ["npm", "start"]