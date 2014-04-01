(function(angular) {
  'use strict';

  /**
   * Academics controller
   */
  angular.module('calcentral.controllers').controller('AcademicsController', function(apiService, badgesFactory, $http, $routeParams, $scope, $q) {

    apiService.util.setTitle('My Academics');

    var gradeOptions = [
      {
        grade: 'A+',
        weight: 4
      },
      {
        grade: 'A',
        weight: 4
      },
      {
        grade: 'A-',
        weight: 3.7
      },
      {
        grade: 'B+',
        weight: 3.3
      },
      {
        grade: 'B',
        weight: 3
      },
      {
        grade: 'B-',
        weight: 2.7
      },
      {
        grade: 'C+',
        weight: 2.3
      },
      {
        grade: 'C',
        weight: 2
      },
      {
        grade: 'C-',
        weight: 1.7
      },
      {
        grade: 'D+',
        weight: 1.3
      },
      {
        grade: 'D',
        weight: 1
      },
      {
        grade: 'D-',
        weight: 0.7
      },
      {
        grade: 'F',
        weight: 0
      },
      {
        grade: 'P/NP',
        weight: -1
      }
    ];

    /**
     * We're putting the exams in buckets per date
     */
    var parseExamSchedule = function(examSchedule) {

      if (!examSchedule) {
        return;
      }

      var response = {};
      angular.forEach(examSchedule, function(element) {
        if (!response[element.date.epoch]) {
          response[element.date.epoch] = [];
        }
        response[element.date.epoch].push(element);
      });
      $scope.examSchedule = response;
      $scope.examScheduleLength = Object.keys(response).length;
    };

    var checkPageExists = function(page) {
      if (!page) {
        apiService.util.redirect('404');
        return false;
      } else {
        return true;
      }
    };

    var updatePrevNextSemester = function(semestersLists, selectedSemester) {
      var nextSemester = {};
      var nextSemesterCompare = false;
      var previousSemester = {};
      var previousSemesterCompare = false;
      var selectedSemesterCompare = selectedSemester.term_yr + selectedSemester.term_cd;
      angular.forEach(semestersLists, function(semesterList) {
        angular.forEach(semesterList, function(semester) {
          var cmp = semester.term_yr + semester.term_cd;
          if ((cmp < selectedSemesterCompare) && (!previousSemesterCompare || (cmp > previousSemesterCompare))) {
            previousSemesterCompare = cmp;
            previousSemester.slug = semester.slug;
          } else if ((cmp > selectedSemesterCompare) && (!nextSemesterCompare || (cmp < nextSemesterCompare))) {
            nextSemesterCompare = cmp;
            nextSemester.slug = semester.slug;
          }
        });
      });
      $scope.nextSemester = nextSemester;
      $scope.previousSemester = previousSemester;
      $scope.previousNextSemesterShow = (nextSemesterCompare || previousSemesterCompare);
    };

    var findSemester = function(semesters, slug, selectedSemester) {
      if (selectedSemester || !semesters) {
        return selectedSemester;
      }

      for (var i = 0; i < semesters.length; i++) {
        if (semesters[i].slug === slug) {
          return semesters[i];
        }
      }
    };

    var getClassesSections = function(courses, findWaitlisted) {
      var classes = [];

      for (var i = 0; i < courses.length; i++) {
        var course = angular.copy(courses[i]);
        var sections = [];
        for (var j = 0; j < course.sections.length; j++) {
          var section = course.sections[j];
          if ((findWaitlisted && section.waitlistPosition) || (!findWaitlisted && !section.waitlistPosition)) {
            sections.push(section);
          }
        }
        if (sections.length) {
          course.sections = sections;
          classes.push(course);
        }
      }

      return classes;
    };

    var getAllClasses = function(semesters) {
      var classes = [];
      for (var i = 0; i < semesters.length; i++) {
        for (var j = 0; j < semesters[i].classes.length; j++) {
          if (semesters[i].time_bucket !== 'future') {
            classes.push(semesters[i].classes[j]);
          }
        }
      }

      return classes;
    };

    var getPreviousClasses = function(semesters) {
      var classes = [];
      for (var i = 0; i < semesters.length; i++) {
        for (var j = 0; j < semesters[i].classes.length; j++) {
          if (semesters[i].time_bucket !== 'future' && semesters[i].time_bucket !== 'current') {
            classes.push(semesters[i].classes[j]);
          }
        }
      }

      return classes;
    };

    var findTeachingSemester = function(semesters, semester) {
      for (var i = 0; i < semesters.length; i++) {
        if (semester.slug === semesters[i].slug) {
          return true;
        }
      }
      return false;
    };

    var parseTeaching = function(teaching_semesters) {

      if (!teaching_semesters) {
        return {};
      }

      var teaching = {};
      for (var i = 0; i < teaching_semesters.length; i++) {
        var semester = teaching_semesters[i];
        for (var j = 0; j < semester.classes.length; j++) {
          var course = semester.classes[j];
          if (!teaching[course.slug]) {
            teaching[course.slug] = {
              course_code: course.course_code,
              title: course.title,
              slug: course.slug,
              semesters: []
            };
          }
          var semesterItem = {
            name: semester.name,
            slug: semester.slug
          };
          if (!findTeachingSemester(teaching[course.slug].semesters, semesterItem)) {
            teaching[course.slug].semesters.push(semesterItem);
          }
        }
      }
      return teaching;

    };

    var countSectionItem = function(selected_course, sectionItem) {
      var count = 0;
      for (var i = 0; i < selected_course.sections.length; i++) {
        if (selected_course.sections[i][sectionItem] && selected_course.sections[i][sectionItem].length) {
          count += selected_course.sections[i][sectionItem].length;
        }
      }
      return count;
    };

    var parseAcademics = function(data) {
      angular.extend($scope, data);

      $scope.semesters = data.semesters;

      $scope.allCourses = getAllClasses(data.semesters);
      $scope.previousCourses = getPreviousClasses(data.semesters);

      $scope.isUndergraduate = ($scope.college_and_level && $scope.college_and_level.standing === 'Undergraduate');

      $scope.teaching = parseTeaching(data.teaching_semesters);
      $scope.teachingLength = Object.keys($scope.teaching).length;

      // Get selected semester from URL params and extract data from semesters array
      var semesterSlug = ($routeParams.semesterSlug || $routeParams.teachingSemesterSlug);
      if (semesterSlug) {
        var isInstructorOrGsi = !!$routeParams.teachingSemesterSlug;
        var selectedStudentSemester = findSemester(data.semesters, semesterSlug, selectedStudentSemester);
        var selectedTeachingSemester = findSemester(data.teaching_semesters, semesterSlug, selectedTeachingSemester);
        var selectedSemester = (selectedStudentSemester || selectedTeachingSemester);
        if (!checkPageExists(selectedSemester)) {
          return;
        }
        updatePrevNextSemester([data.semesters, data.teaching_semesters], selectedSemester);

        $scope.selectedSemester = selectedSemester;
        if (selectedStudentSemester) {
          $scope.selectedCourses = selectedStudentSemester.classes;
          if (!isInstructorOrGsi) {
            $scope.enrolledCourses = getClassesSections(selectedStudentSemester.classes, false);
            $scope.waitlistedCourses = getClassesSections(selectedStudentSemester.classes, true);
          }
        }
        $scope.selectedStudentSemester = selectedStudentSemester;
        $scope.isInstructorOrGsi = isInstructorOrGsi;
        $scope.selectedTeachingSemester = selectedTeachingSemester;

        // Get selected course from URL params and extract data from selected semester schedule
        if ($routeParams.classSlug) {
          var classSemester = selectedStudentSemester;
          if (isInstructorOrGsi) {
            classSemester = selectedTeachingSemester;
          }
          for (var i = 0; i < classSemester.classes.length; i++) {
            var course = classSemester.classes[i];
            if (course.slug === $routeParams.classSlug) {
              $scope.selected_course = course;
              if (isInstructorOrGsi) {
                $scope.campusCourseId = course.course_id;
              }
              break;
            }
          }
          if (!checkPageExists($scope.selected_course)) {
            return;
          }
          $scope.selectedCourseCountInstructors = countSectionItem($scope.selected_course, 'instructors');
          $scope.selectedCourseCountSchedules = countSectionItem($scope.selected_course, 'schedules');
        }
      }

      parseExamSchedule(data.exam_schedule);

      $scope.gpaInit(); // Initialize GPA calculator with selected courses

      $scope.telebears = data.telebears;
      parseSchedule();
    };

    /**
     * Finds current semester and stores a sorted list of the schedule
     * Starts with M 12:00AM
     */
    var parseSchedule = function() {
      $scope.schedule = [];

      var cur_semester; // find current semester in data
      for (var i = 0; i < $scope.semesters.length; i++) {
        cur_semester = $scope.semesters[i];
        if (cur_semester.time_bucket === 'current') {
          break;
        }
      }

      for (var a = 0; a < cur_semester.classes.length; a++) {
        var klass = cur_semester.classes[a];
        for (var b = 0; b < klass.sections.length; b++) {
          var section = klass.sections[b];
          for (var c = 0; c < section.schedules.length; c++) {
            var s = section.schedules[c];
            parseScheduleString(s.schedule, {
              'buildingName': s.buildingName,
              'roomNumber': s.roomNumber,
              'courseName': klass.course_code,
            });
          }
        }
      }

      $scope.schedule.sort(compareBlocks);
      $scope.nextClass = $scope.getNextClass();
      console.log($scope.nextClass);
      console.log($scope.schedule);
    };

    var DAY_STRINGS = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];

    /**
     * Parses strings like "MW 1:00P-2:00P" into a list of objects
     * Each object has these properties:
     *
     * day, startTime, endTime, timeString,
     * courseName, buildingName, roomNumber
     */
    var parseScheduleString = function(s, info) {
      var space = s.indexOf(' ');
      var dash = s.indexOf('-');
      if (space === -1 || dash === -1) {
        return; // not an acceptable schedule block
      }
      info.timeString = s.substring(space + 1);
      info.startTime = timeToMinutes(s.substring(space + 1, dash));
      info.endTime = timeToMinutes(s.substring(dash + 1));

      var days = s.substring(0, space);
      var upper = days.toUpperCase();
      var j = 0;
      for (var i = 1; i <= days.length; i++) {
        if (i === days.length || upper[i] === days[i]) {
          var day = DAY_STRINGS.indexOf(days.substring(j, i));
          var block = {};
          block.day = day;
          angular.extend(block, info); // a copy of info
          $scope.schedule.push(block);
          j = i;
        }
      }
    };

    /** Converts a string like "3:00P" into minutes */
    var timeToMinutes = function(s) {
      var colon = s.indexOf(':');
      var hours = +s.substring(0, colon);
      var minutes = +s.substring(colon + 1, s.length - 1);
      if (s[s.length - 1] === 'P') {
        hours += 12;
      }
      return hours * 60 + minutes;
    };

    var compareBlocks = function(block1, block2) {
      if (block1.day < block2.day) {
        return -1;
      }
      if (block1.day > block2.day) {
        return 1;
      }
      return block1.startTime - block2.startTime;
    };

    $scope.getNextClass = function() {
      return getNextClass(new Date());
    };

    var getNextClass = function(time) {
      var day = time.getDay();
      var minutes = time.getHours() * 60 + time.getMinutes();
      for (var i = 0; i < $scope.schedule.length - 1; i++) {
        var b = $scope.schedule[i];
        if (compareBlocks(b, {day: day, startTime: minutes}) > 0) {
          return $scope.schedule[i];
        }
      }
      return $scope.schedule[$scope.schedule.length - 1];
    };

    $scope.currentSelection = 'Class Info';
    $scope.selectOptions = ['Class Info', 'Class Roster'];

    $scope.switchSelectedOption = function(selectedOption) {
      $scope.currentSelection = selectedOption;
    };

    $scope.addTelebearsAppointment = function(phasesArray) {
      var phases = [];
      $scope.telebearsAppointmentLoading = 'Process';
      for (var i = 0; i < phasesArray.length; i++) {
        var payload = {
          'summary': phasesArray[i].period,
          'start': {
            'epoch': phasesArray[i].startTime.epoch
          },
          'end': {
            'epoch': phasesArray[i].endTime.epoch
          }
        };
        apiService.analytics.sendEvent('Telebears', 'Add Appointment', 'Phase: ' + payload.summary);
        phases.push($http.post('/api/my/event', payload));
      }
      $q.all(phases).then(function() {
        $scope.telebearsAppointmentLoading = 'Success';
      }, function() {
        $scope.telebearsAppointmentLoading = 'Error';
      });
    };

    $scope.hideDisclaimer = true;

    $scope.toggleBlockHistory = function() {
      $scope.showBlockHistory = !$scope.showBlockHistory;
      apiService.analytics.sendEvent('Block history', 'Show history panel - ' + $scope.showBlockHistory ? 'Show' : 'Hide');
    };

    $scope.gradeOptions = gradeOptions;

    var findWeight = function(grade) {
      var weight = gradeOptions.filter(function(element) {
        return element.grade === grade;
      });
      return weight[0];
    };

    var gpaCalculate = function() {
      // Recalculate GPA on every dropdown change.
      var totalUnits = 0;
      var totalScore = 0;

      angular.forEach($scope.selectedCourses, function(course) {
        if (course.units) {
          var grade;
          if (course.grade && findWeight(course.grade)) {
            grade = findWeight(course.grade).weight;
          } else {
            grade = course.estimatedGrade;
          }
          if (grade && grade !== -1) {
            course.score = parseFloat(grade, 10) * course.units;
            totalUnits += parseFloat(course.units, 10);
            totalScore += course.score;
          }
        }
      });
      $scope.estimatedGpa = totalScore / totalUnits;
    };

    $scope.gpaUpdateCourse = function(course, estimatedGrade) {
      // Update course object on scope and recalculate overall GPA
      course.estimatedGrade = estimatedGrade;
      gpaCalculate();
      cumulativeGpaCalculate($scope.allCourses, 'estimated');
    };

    $scope.gpaInit = function() {
      // On page load, set default values and calculate starter GPA
      angular.forEach($scope.selectedCourses, function(course) {
        if (course.grade_option === 'Letter') {
          course.estimatedGrade = 4;
        } else if (course.grade_option === 'P/NP' || course.grade_option === 'S/U') {
          course.estimatedGrade = -1;
        }
      });
      gpaCalculate();
      cumulativeGpaCalculate($scope.previousCourses, 'current');
      cumulativeGpaCalculate($scope.allCourses, 'estimated');
    };

    var cumulativeGpaCalculate = function(courses, gpaType) {
      // Recalculate GPA on every dropdown change.
      var totalUnits = 0;
      var totalScore = 0;
      angular.forEach(courses, function(course) {
        if (course.units) {
          var grade;
          if (course.grade && findWeight(course.grade)) {
            grade = findWeight(course.grade).weight;
          } else {
            if (gpaType === 'estimated') {
              grade = course.estimatedGrade;
            }
          }
          if ((grade || grade === 0) && grade !== -1) {
            course.score = parseFloat(grade, 10) * course.units;
            totalUnits += parseFloat(course.units, 10);
            totalScore += course.score;
          }
        }
      });
      if (gpaType === 'estimated') {
        $scope.estimatedCumulativeGpa = totalScore / totalUnits;
      } else {
        $scope.currentCumulativeGpa = totalScore / totalUnits;
      }
    };

    // Wait until user profile is fully loaded before hitting academics data
    $scope.$on('calcentral.api.user.isAuthenticated', function(event, isAuthenticated) {
      if (isAuthenticated) {
        $scope.canViewAcademics = $scope.api.user.profile.hasAcademicsTab;
        $http.get('/api/my/academics').success(parseAcademics);
        badgesFactory.getBadges().success(function(data) {
          $scope.studentInfo = data.studentInfo;
        });
        //$http.get('/dummy/json/academics.json').success(parseAcademics);
      }
    });

  });
})(window.angular);
