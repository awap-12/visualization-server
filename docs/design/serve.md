# Analyze requirement

The focus of this module is to serve static files. This means user, page related info
should not include here. Here we should save chart's name, description, file's path
or table for rendering. 

```mermaid
erDiagram
	chart ||--|{ file: file_url
	chart {
		string id
		string name
		string description
		int userId
	}
	file {
		string url
		string name
		string info
		text data
	}
```

But during the further discussion, we notice in v3-v4, v6, 7, 10 contains shared files.
Under the suggestions form the supervisor. We enhance old plan by extract file or
database storage strategy logic into multi-table and do a many-to-many mapping between
chart and file table.

Local storage table: should storage binding to local static file(or file storage server)
Data storage table: should storage binding to a table.

```mermaid
erDiagram
	chart ||--|{ chart_files: chart_id
	chart {
		string id
		string name
		string description
		int userId
	}
	file ||--|{ chart_files: file_url
	file {
		string url
		string name
		enum strategy
		string info
		string owner
	}
	file ||--o| local: file_id
	file ||--o| database: file_id 
```

# Behaviour

## Storage(local/database) module

In the storage module, we should handle both local storage and database storage.

- **Handles**:

	- **_saveStorage_**: Save a storage and use models hooks for trigger IO and database handling.
		In IO handling, we will move exist file path to correct place(the path generate from chartId).

	- **_getStorage_**: Get a storage based on File model. Get both local and database storage.(we
		can create/get both local and database here).

	- **_updateStorage_**: Update a storage.
		In IO handling, replace correct path with new file;
		In database handling, calculate difference with different operation (Simple implement: drop
		old database and create new database).

	- **_deleteStorage_**: Remove a storage based on File model.
		Due to one-to-one relationship, this function have to remove this table because of cascade(In
		the further study, cascade not able to trigger model hooks. So, Here replace cascade by set
		null).

## File module

In the file module we should handle file info and both local storage and database storage.
It designs like an extender for storage, which has a one-to-one relationship.

- **Handles**:

	- **_saveFile_**: Alias for **_saveStorage_**.

	- **_getFileByUrl_**: Alias for **_getStorage_**.

	- **_updateFile_**: In update file handle, we should distinguish different strategy:

		- **update the strategy** -> remove old storage, and create new storage
		- **same strategy** -> use alias for **_updateStorage_**.

	- **_deleteFile_**: Alias for **_deleteStorage_**.

## Chart module

In the chart module we should handle file and chart tables. However, we have to face a problem that
multiple chart use a single file. So a many-to-many relationship should be used.

- **Handles**:

	- **_saveChart_**: We should insert both chart and file data into tables, if file have been created,
		we have to check did file exists before insert action;

	- **_getChartById_**: Chart should be found in this function with file data, which means we have to
		inner join all of ChartFile -> File -> Local/Database -> Database Linked file(optional).

	- **_updateChart_**: In this function we can insert, modified and delete chart and handle file by
		**_saveFile_**, **_updateFile_** and **_deleteFile_**.

	- **_deleteChart_**: Remove chart and try to delete files based on relationship.

