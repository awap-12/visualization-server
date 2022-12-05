## Design

The focus of this module is to serve static files. So, user, page related should not include here.

Here we should save chart's name, description, file's path for rendering.

But I notice in v3-v4 contains shared files. So, we should extract file into another table,
and do a many-to-many mapping.

During the further study, I notice description could be store more details, I think a better structure for description
would be better. e.g. link and content might be good to divide which could collect link better. But these kinds of
setting will increase user's operation.

