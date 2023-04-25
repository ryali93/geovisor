FROM nginx:latest

COPY nginx-custom.conf /etc/nginx/conf.d/default.conf
COPY --from=build /usr/src/app/dist/frontend /usr/share/nginx/html