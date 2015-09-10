﻿/*globals getRouteTo,_gaq*/
var originalInput,
    originalSearchInput,
    sendToFriendTemplate = "mailto:?subject=Job Opening: {0} &body=I came across this job on the internet and I thought that you or someone you know might be interested. {1}",
    catsoneUrl,
    linkType;

// JQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    "use strict";
    $('body').scrollspy(
        {
            target: '.navbar-fixed-top',
            offset: 92
        }
    );

    function scrollToID(id, speed) {
        var offSet = 88,
            targetOffset = $(id).offset().top - offSet,
            mainNav = $('#main-nav');
        $('html,body').animate({ scrollTop: targetOffset }, speed);
        if (mainNav.hasClass("open")) {
            mainNav.css("height", "1px").removeClass("in").addClass("collapse");
            mainNav.removeClass("open");
        }
    }

    // Remove watermark on focus
    function watermarktext_focus(obj) {
        $(obj).removeClass("maqwatermark requiredInput");
        if (obj.value === obj.title) {
            obj.value = "";
        }
        $(obj).removeClass("helpText");
    }

    // Set original watermark on blur
    function watermarktext_blur(obj) {
        if (obj.value === "") {
            obj.value = originalInput;
            obj.title = originalInput;
            $(obj).addClass("maqwatermark");
            $(obj).removeClass("textBoxFocus");
            $(obj).addClass("helpText");
        }
    }

    // Set the watermark text on search input
    function setWaterMarkText() {
        $('.maqwatermark').each(function () {
            if (($(this)[0].value === "" || $(this)[0].value === $(this)[0].title)) {
                $(this).val($(this)[0].title);
            }
            $(this).bind("focus", function () { watermarktext_focus($(this)[0]); });
            $(this).bind("click", function () { watermarktext_focus($(this)[0]); });
            $(this).bind("blur", function () { watermarktext_blur($(this)[0]); });
        });

    }

    $('a.page-scroll').on('click', function (event) {
        event.preventDefault();
        var sectionID = $(this).attr("href");
        scrollToID(sectionID, 750);
    });

    // Mobile nav toggle
    $('#nav-toggle').on('click', function (event) {
        event.preventDefault();
        $('#main-nav').toggleClass("open");
    });

    // To set the placeholder for search input on load
    setWaterMarkText();
    originalInput = document.getElementById("directionInput").title;
    originalSearchInput = document.getElementById("searchJobListing").title;
    // Get Job listings
    var jsonData = {
        getListings: "http://maqconsulting.catsone.com/careers/index.php?m=portal&a=listings&sort=posted&sortDir=desc&page=1"
    };

    function getJobListings(dataParams, successCallback) {
        catsoneUrl = dataParams.getListings;
        linkType = dataParams.linkType;
        $.ajax({
            url: 'http://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent('select * from html where url="' + catsoneUrl + '"') + '&format=html',
            type: 'GET',
            contentType: 'text/html; charset=UTF-8',
            dataType: 'jsonp',
            success: function (data) {
                data = data.results[0].replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace('src=\"/images/portal/rssIcon.png\"', '').replace('src=\"/images/dialogPointer.gif\"', '').replace('src=\"/images/datagrid/sortDesc.gif\"', '').replace('src=\"/images/icons/magnifier_medium.png\"', '').replace('src=\"/images/v3/poweredByCATS.png\"', '').replace('magnifier_medium.png ', '');
                $("#jobListingContainer").append('<div class="hidden">' + data + '</div>');
                if ("pagination" === linkType) {
                    $(".hidden").html($(".hidden #jobListingsContent"));
                } else if ("jobTitle" === linkType) {
                    var htmlNode = $(".hidden #stepJobDetails").html();
                    htmlNode = htmlNode.replace("<table", "<div").replace("</table>", "</div>").replace("<tbody", "<div").replace("</tbody>", "</div>").replace("<tr", "<div").replace("</tr>", "</div>").replace("<td", "<div").replace("</td>", "</div>").replace("<ul", "<ol").replace("</ul>", "</ol>").replace(("MSJobs@maqconsulting.com"), "<a class='mailLink' href='mailto:MSJobs@MAQConsulting.com'>MSJobs@MAQConsulting.com</a>");
                    $(".hidden").html(htmlNode);
                } else {
                    $(".hidden").html($(".hidden #jobListingsContent"));
                }

                successCallback($(".hidden").html());
            },
            error: function (data) {
                console.log(data);
            }
        });
    }

    function successFunction(data) {
        $(".hidden").remove();
        $("#dumpData").html(data);
        $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
        $(".loadingIcon").hide();
        if ($("#dumpData #jobListings").length) {
            $("#jobListingContainer").show();
            $("#jobListingsData").html(data);
        } else if ($("#dumpData #jobDetails").length) {
            $("#jobDescriptionContainer").after($("#jobActionBtnContainer"));
            $("#jobDescriptionContainer").html(data).show();
            $("#jobDetailPosted").after($("#jobActionBtnContainer"));
            $("#jobActionBtnContainer").show();
            sendToFriendTemplate = sendToFriendTemplate.replace("{0}", $("#dumpData #jobTitle").html());
        }

        $(".pageSelector").bind("click", function (e) {
            e.preventDefault();
            jsonData = {
                getListings: "http://maqconsulting.catsone.com/careers/" + $(this).attr("href"),
                linkType: "pagination"
            };
            getJobListings(jsonData, successFunction);
            $(".loadingIcon").show();
            $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
        });
        $("#jobListings .rowEven, #jobListings .rowOdd").bind("click", function (e) {
            e.preventDefault();
            jsonData = {
                getListings: $(this).find(".jobTitle").attr("href"),
                linkType: "jobTitle"
            };
            getJobListings(jsonData, successFunction);
            sendToFriendTemplate = sendToFriendTemplate.replace("{1}", $(this).find(".jobTitle").attr("href"));
            $(".loadingIcon").show();
            $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
        });
    }

    getJobListings(jsonData, successFunction);
    $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
    $(".contactLoadingIcon").hide();

    // Get the locations for redmond on load
    function getLocation() {
        var directionInputData,
            latitude = 47.633087,
            longitude = -122.133202,
            eDirectionInput = $("#directionInput");
        document.getElementById('directions').innerHTML = "";
        if (eDirectionInput.hasClass("helpText") && eDirectionInput.hasClass("maqwatermark")) {
            eDirectionInput.addClass("requiredInput");
            eDirectionInput.val("REQUIRED");
            eDirectionInput.attr("title", "REQUIRED");
        } else {
            eDirectionInput.removeClass("requiredInput");
            directionInputData = document.getElementById("directionInput").value;
            $('#directionInput').attr('title', directionInputData);
            getRouteTo(latitude, longitude, directionInputData);
            $(".contactLoadingIcon").show();
            $("html, body").animate({ scrollTop: $(document).height() }, 750);
        }
    }

    // Handler to show directions on enter
    function handleEnter_direction(args) {
        if (args) {
            var e = window.event || args,
                keyunicode = e.charCode || e.keyCode;
            if (keyunicode === 13) {
                $('#show').focus();
            }
        }
    }

    $("#backToJobsBtn").bind("click", function () {
        // Get Job listings
        jsonData = {
            getListings: "http://maqconsulting.catsone.com/careers/index.php?m=portal&portalID=850"
        };

        getJobListings(jsonData, successFunction);
        $(".loadingIcon").show();
        $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
    });
    $(window).resize(function () {
        if ($(window).width() <= 674) {
            $(".detailsJobDescription").after($("#jobActionBtnContainer"));
        } else {
            $("#jobDetailPosted").after($("#jobActionBtnContainer"));
        }
    });
    $("#searchJobListing").keypress(function (e) {
        if (e.which === 13) {
            jsonData = {
                getListings: "http://maqconsulting.catsone.com/careers/index.php?search=" + $(this).val() + "&categories=%5B%5D"
            };
            getJobListings(jsonData, successFunction);
            $(".loadingIcon").show();
            $("#jobListingContainer, #jobDescriptionContainer, #jobActionBtnContainer").hide();
            return false;
        }
    });
    $("#searchJobListing").bind("focus", function () {
        $(this).removeClass("helpText");
        $(this).val("");
    });
    $("#searchJobListing").bind("blur", function () {
        if ($(this).val() === "") {
            $(this).val(originalSearchInput);
            $(this).title = originalSearchInput;
            $(this).addClass("helpText");
        }
    });

    $("#sendToFriendBtn").click(function () {
        window.location = sendToFriendTemplate;
        _gaq.push(['_trackEvent', 'Send to friend', 'Click', 'On Send to friend Button click']);
    });

    function resetSearchBox() {
        $("#searchJobListing").val("");
        $("#searchJobListing").val(originalSearchInput);
        $("#searchJobListing").title = originalSearchInput;
        $("#searchJobListing").addClass("helpText");
        jsonData = {
            getListings: "http://maqconsulting.catsone.com/careers/index.php?m=portal&a=listings&sort=posted&sortDir=desc&page=1"
        };
        getJobListings(jsonData, successFunction);
    }
});