import { useDispatch } from 'react-redux';
import { CHANGE_STATUS, setLoading, unsetLoading } from './ui';
import { useNavigate } from 'react-router-dom';

//exports
export const GET_FEED = 'GET_FEED';
export const UPDATE_ONE_TEAM = 'UPDATE_ONE_TEAM';
export const DELETE_ONE_TEAM = 'DELETE_ONE_TEAM';

//actions

export const updateTeamAction = (team, method) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading());
      let local_method = method;
      if (!local_method) {
        local_method = 'PUT';
      }
      switch (local_method) {
        case 'PUT':
          dispatch({
            type: UPDATE_ONE_TEAM,
            payload: team,
          });
          break;
        case 'DELETE':
          dispatch({
            type: DELETE_ONE_TEAM,
            payload: team,
          });
          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
    dispatch(unsetLoading());
  };
};
export const isMember = (team_id) => {
  return async (dispatch, getState) => {
    try {
      const teams = getState().feed.feed;
      const user = getState().user_data.logged_user;
      const team = teams.find((team) => team.id === team_id);
      const alreadyMember = team.members.find(
        (member) => member.user_id === user.id
      );
      return alreadyMember ? true : false;
    } catch (error) {
      dispatch({
        type: CHANGE_STATUS,
        payload: {
          status: 500,
          text: 'An error occured in isMember block.',
        },
      });
    }
  };
}; //feed
export const getTeams = ({ offset, limit }) => {
  return async (dispatch, getState) => {
    try {
      dispatch(setLoading());
      const response = await fetch(
        `${
          import.meta.env.VITE_BACKEND_LINK
        }/feed?offset=${offset}&limit=${limit}`
      );
      if (response.ok) {
        let feed = await response.json();
        console.log(feed);
        dispatch({
          type: GET_FEED,
          payload: feed,
        });
      } else {
        console.log('Error fetching data');
      }
    } catch (error) {
      console.log(error);
    }
    dispatch(unsetLoading());
  };
};
//get one team
export const getOneTeam = ({ id, setTeam }) => {
  return async (dispatch, getState) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_LINK}/teams/${id}`
      );
      if (response.ok) {
        let team = await response.json();
        // setTeam(team);
        dispatch(updateTeamAction(team));
      } else {
        console.log('Error fetching data');
      }
    } catch (error) {
      console.log(error);
    }
  };
};
//create team
export const createTeam = ({ team, setRes }) => {
  console.log('New post req. Got: ', team);
  return async (dispatch, getState) => {
    dispatch(setLoading());
    try {
      const requestBody = JSON.stringify(team);
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_LINK}/teams`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: requestBody,
        }
      );
      if (response.ok) {
        console.log('Team was created.');
        setRes(true);
      } else {
        dispatch({
          type: CHANGE_STATUS,
          payload: {
            status: 400,
            text: 'An error occured while creating a team.',
          },
        });
        console.log('Error creationg a team');
      }
    } catch (error) {
      console.log(error);
      dispatch({
        type: CHANGE_STATUS,
        payload: {
          status: 500,
          text: 'An unexpected error occured while creating a team.',
        },
      });
    }
    dispatch(unsetLoading());
  };
};
//update team
export const updateTeam = ({ team }) => {
  return async (dispatch, getState) => {
    dispatch(setLoading());
    const user = getState().user_data.logged_user;
    if (team.creator_id !== user.id) {
      dispatch({
        type: CHANGE_STATUS,
        payload: {
          status: 403,
          text: 'You must be owner of a team to have an ability to edit this team.',
        },
      });
    } else {
      try {
        const requestBody = JSON.stringify(team);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_LINK}/teams/${team.id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
          }
        );
        if (response.ok) {
          const res = await response.json();
          dispatch(updateTeamAction(res));
          dispatch({
            type: CHANGE_STATUS,
            payload: {
              status: 200,
              text: `You successfully updated your team.`,
            },
          });
          //
        } else {
          dispatch({
            type: CHANGE_STATUS,
            payload: {
              status: response.status,
              text: `An error occured while updating a team, status: ${response.status}.`,
            },
          });
        }
      } catch (error) {
        dispatch({
          type: CHANGE_STATUS,
          payload: {
            status: response.status,
            text: `An error occured: ${error}.`,
          },
        });
      }
    }
    dispatch(unsetLoading());
  };
};
//join team
export const joinOrLeave = ({ member_id, team_id, method }) => {
  console.log('Join/Leave req. Member id: ', member_id);
  return async (dispatch, getState) => {
    dispatch(setLoading());
    const user = getState().user_data.logged_user;
    if (!user.id) {
      dispatch({
        type: CHANGE_STATUS,
        payload: {
          status: 403,
          text: 'You must log in to have the ability to join a team.',
        },
      });
    } else {
      try {
        const requestBody = JSON.stringify({
          user_id: user.id,
          member_id: member_id,
        });
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_LINK}/teams/join_or_leave`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
          }
        );
        if (response.ok) {
          //change status - successful widget
          dispatch({
            type: CHANGE_STATUS,
            payload: {
              status: 200,
              text: `You successfully ${
                method === 'join' ? 'joined' : 'left'
              } the team.`,
            },
          });
          //
          let teams = getState().feed.feed;
          console.log('Teams: ', teams);
          let team = teams.find((team) => team.id === team_id);
          console.log('team found:', team.id);
          console.log('method:', method);
          if (method === 'join') {
            console.log('join');
            let OpenRole = team.open_roles.find(
              (slot) => slot.member_id === member_id
            );
            console.log('OpenRole:', OpenRole);
            let open_role_with_user = {
              member_id: OpenRole.member_id,
              role: OpenRole.role,
              user_id: user.id,
              ...user,
            };
            team.open_roles = team.open_roles.filter(
              (slot) => slot.member_id !== member_id
            );
            team.members.push(open_role_with_user);
            dispatch(updateTeamAction(team));
          } else if (method === 'leave') {
            console.log('leave');
            //broken leaving
            let member = team.members.find(
              (member) => member.member_id === member_id
            );
            const clean_members = team.members.filter(
              (slot) => slot.member_id !== member_id
            );
            team.members = clean_members;
            team.open_roles.push({
              role: member.role,
              user_id: null,
              member_id: member_id,
            });
            dispatch(updateTeamAction(team));
          }
          //1. get team, find the right team, add member, dispatch.
        } else if (response.status === 409) {
          console.log('DUPLICATE.');
          dispatch({
            type: CHANGE_STATUS,
            payload: {
              status: response.status,
              text: 'You are already part of this team.',
            },
          });
        } else {
          console.log('Error creationg a team');
        }
      } catch (error) {
        console.log(error);
      }
    }
    dispatch(unsetLoading());
  };
};
//kick member of a team
export const kickMember = ({ member, team }) => {
  console.log('Kick member req. Member: ${member.id}');
  return async (dispatch, getState) => {
    dispatch(setLoading());
    const user = getState().user_data.logged_user;
    if (team.creator_id !== user.id) {
      dispatch({
        type: CHANGE_STATUS,
        payload: {
          status: 403,
          text: 'You must be owner of a team to have an ability to kick users.',
        },
      });
    } else {
      try {
        const requestBody = JSON.stringify({
          team_id: team.id,
          member_id: member.member_id,
        });
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_LINK}/teams/kick`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: requestBody,
          }
        );
        if (response.ok) {
          const res = await response.json();
          dispatch(updateTeamAction(res));
          dispatch({
            type: CHANGE_STATUS,
            payload: {
              status: 200,
              text: `You successfully kicked ${member.username} from your team.`,
            },
          });
          //
        } else {
          dispatch({
            type: CHANGE_STATUS,
            payload: {
              status: response.status,
              text: `An error occured while kicking ${member.username}, status: ${response.status}.`,
            },
          });
        }
      } catch (error) {
        dispatch({
          type: CHANGE_STATUS,
          payload: {
            status: response.status,
            text: `An error occured: ${error}.`,
          },
        });
      }
    }
    dispatch(unsetLoading());
  };
};

export const deleteTeam = ({ team, setRes }) => {
  return async (dispatch, getState) => {
    dispatch(setLoading());
    const user = getState().user_data.logged_user;
    if (team.creator_id !== user.id) {
      dispatch({
        type: CHANGE_STATUS,
        payload: {
          status: 403,
          text: 'You must be owner of a team to have an ability to delete this team.',
        },
      });
    } else {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_LINK}/teams/${team.id}`,
          {
            method: 'DELETE',
          }
        );
        console.log(response);
        if (response.ok) {
          dispatch(updateTeamAction(team.id, 'delete'));
          dispatch({
            type: CHANGE_STATUS,
            payload: {
              status: response.status,
              text: `Successfully deleted.`,
            },
          });
          setRes(true);
          //
        } else {
          dispatch({
            type: CHANGE_STATUS,
            payload: {
              status: response.status,
              text: `An error occured while deleting a team, status: ${response.status}.`,
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
    dispatch(unsetLoading());
  };
};
