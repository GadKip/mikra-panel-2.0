# mikra-panel-2.0
Sign in and upload panel

Summary fo AI:

You're absolutely right, that's a smart idea! Taking a break is well-deserved after all that debugging, and having a detailed summary will make it much easier for you to pick up where we left off in the future.

While I, as an AI, don't have a persistent memory in the way humans do, I can generate a highly detailed summary of our entire interaction. This summary will include all the important points we've covered, the specific code changes we made, and the reasons behind each of those changes.

Here's a comprehensive summary of our journey, designed to help me understand the current state of your project in our next interaction:

Project Overview:

Application Type: React Native application using Expo Router for navigation and Appwrite for backend services (authentication and storage).

Purpose: An app for users to upload content, requiring user authentication, data fetching and file uploads.

Key Technologies:

React Native

Expo Router (for navigation)

Appwrite (for backend services)

react-native-appwrite (Appwrite SDK)

react-native-session-storage (for session persistence)

Tailwind CSS (for styling)

Context API for state management

Core Functionalities:

User Authentication:

User sign-in (email and password)

User sign-up (email, password, username) - (optional)

Session management (persistence and invalidation)

User retrieval

File Upload:

Ability to upload text files using react-native-blob and Appwrite Storage.

Navigation:

Routing using Expo Router

Conditional redirects based on user authentication.

Loading Indicators:

Custom loading indicator component (Loader) used for asynchronous operations.

Custom Alerts:

Custom alert component (CustomAlert) used to display alerts using a context provider.

Key Components and Files:

app/index.jsx: The main screen. Handles redirection based on login status, displays the logo and the "Login" button.

app/(auth)/sign-in.jsx: User sign-in screen. Handles email and password input and calls the signIn function, and redirects to /upload on success.

app/(auth)/sign-up.jsx: User sign-up screen. Handles username, email and password input and calls the createUser function, and redirects to /upload on success. (optional).

components/CustomButton.jsx: Reusable button component with customizable styles and loading state.

components/Loader.jsx: Loading component that displays a spinning animation

lib/appwrite.js: Contains all helper functions to communicate with the Appwrite API:

getCurrentUser: Fetches the current user information

createUser: Creates a new user with email, password, and username.

signIn: Signs in a user with email and password and returns the user.

signOut: Signs out the current user.

upload: Uploads a file to the Appwrite storage

context/GlobalProvider.jsx: Provides a global context to handle the app's state, including the Appwrite client, loading state, user data, and authentication status.

context/AlertContext.jsx: Provides a global context for the custom alert component, to show it from anywhere in the application.

app/_layout.jsx: Root layout for the application, sets up global styles, font loading, appwrite client initialization, and a stack navigator.

app/(auth)/_layout.jsx: Layout for the authentication routes, controls the layout of the sign in and sign up components - (can be removed).

lib/utils.js: Contains utility functions, such as handleUploadFileError that displays an alert when an error happens when uploading.

components/CustomAlert.jsx: Custom alert component to replace the native alert function.

Main Errors Resolved:

TypeError: Cannot read properties of null (reading 'config') (Initial Load):

Problem: The config object was null when the app was first loading, and it caused the Appwrite's getCurrentUser to fail.

Solution: The problem was fixed by only calling fetchUser after the client object is initialized in the GlobalProvider, and after loading a potential session from the local storage.

TypeError: Cannot read properties of null (reading 'config') (SignIn):

Problem: The config object was null during the sign in process, and caused the Appwrite's getCurrentUser to fail after a successful sign in.

Solution: The problem was fixed by correctly passing the client context variable to all of the Appwrite methods, and also to clear all existing sessions before trying to create a new session. Also, the call to getCurrentUser on sign in, was removed.

AppwriteException: User (role: guests) missing scope (account)

Problem: The Appwrite exception means that the current user (identified as having the role "guests") is trying to access a resource (account) that requires a specific scope, and that user role is not allowed to access the account information.

Solution: We now remove all existing sessions from Appwrite before creating a new one, to guarantee that the user is not using an existing guest session.

props.pointerEvents is deprecated. Use style.pointerEvents:

Problem: The TouchableOpacity component, used by CustomButton, was using props.pointerEvents, a deprecated method of setting the pointer events.

Solution: We removed the disabled prop, and set the pointerEvents style prop on the TouchableOpacity component.

Unexpected text node: . A text node cannot be a child of a <View>.

Problem: The React-Native-Web implementation throws this error when trying to add text directly inside a view.

Solution: The solution was to add a text tag, with style={{display:"none"}} as a sibling of the ScrollView inside the SafeAreaView.

401 (Unauthorized) Error:

Problem: The request to Appwrite's /v1/account/sessions endpoint was being made without proper authorization. This was happening inside the signIn function when calling signOut.

Solution: A try catch block was added to the signOut method, so it doesn't cause an error when the user is not signed in.

Key Code Changes and Logic:

GlobalProvider.jsx:

Implemented the correct initialization of the Appwrite client using a useRef variable.

Implemented a fetchSession method to load the session from session storage, and only then call the getCurrentUser method.

The fetchSession method is only called once, when the component is first rendered.

Provides all of the necessary state to the context, including the setLoading function.

appwrite.js:

Removed the initial initialization of the Appwrite objects.

All of the Appwrite objects are now created with the client that is passed as a parameter, in each of the methods.

The setClientSessionFromStorage is used before all methods that require the user's session.

Implemented the correct logic for removing the current user session, and creating a new session when signing in.

CustomButton.jsx:

Replaced the props.pointerEvents prop with the correct style prop.

sign-in.jsx: Removed the extra getCurrentUser call after signing in.

Layout Files: Moved common layout components to _layout.jsx files

utils.js: Implemented a custom hook to use the CustomAlert component.

Important Considerations for the Future:

Custom Domain: Deploy your application to a custom domain to avoid the localStorage warning, and allow the usage of secure cookies.

Permissions: Make sure you set the correct Appwrite permissions for each role, to prevent unauthorized access to your collections.

Error Handling: Check all of the places where you are handling the errors, and make sure that you are using the correct logic and the correct variables.

Testing: Always test your code thoroughly, to make sure that there are no unexpected behaviours, and that the logic is working as intended.

Clean Code: Make sure that the code is well formatted, and that you are using the correct approaches for all of your components, to make your app easier to debug and maintain.

How to Use This Summary:

In our next interaction, feel free to paste this summary, or even just mention that I should refer to the previous conversation. I will review this information, and be able to quickly understand the context of your project.

I hope this summary will be helpful, and that you can use it to pick up where we left off. You've done an incredible job, and I'm here for you if you need me in the future.